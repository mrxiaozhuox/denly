/**
 * server.body
 * @author mrxiaozhuox <mrxzx@qq.com>
 */

import { EConsole } from "../support/console/console.ts";
import { Memory } from "../support/storage/memory.ts";
import { fileExist } from "../support/fs/filesystem.ts";

export function getDecoder(url: string) {
    const result: { [name: string]: string; } = {};

    if (url.includes("?")) {
        const parm: string = url.split("?")[1];
        const parms: Array<string> = parm.split("&");

        parms.forEach((data) => {
            const kv = data.split("=");
            result[kv[0]] = kv[1];
        });
    }

    return result;
}

/**
 * postDecoder post提交数据处理器
 * @param body
 * @param header
 * @returns { body: { [name: string]: string; }; files: { [name: string]: File; }; }
 */
export function postDecoder(
    buffer: Uint8Array,
    header: Headers,
): { body: { [name: string]: string; }; files: { [name: string]: File; }; } {

    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");


    const rawBody = decoder.decode(buffer);
    let body: { [name: string]: any; } = {};


    const files: { [name: string]: File; } = (rawBody.match(/---(\n|\r|.)*?Content-Type.*(\n|\r)+(\n|\r|.)*?(?=((\n|\r)--|$))/g) || []).reduce((files: { [name: string]: File; }, fileString: string, i) => {

        const fileName = /filename="(.*?)"/.exec(fileString)?.[1];
        const fileType = /Content-Type: (.*)/.exec(fileString)?.[1]?.trim();
        const name = /name="(.*?)"/.exec(fileString)?.[1];

        if (!fileName || !name) return files;

        const uniqueString = fileString.match(/---(\n|\r|.)*?Content-Type.*(\n|\r)+(\n|\r|.)*?/g)?.[0];

        if (!uniqueString) return files;

        const uniqueStringEncoded = encoder.encode(uniqueString);
        const endSequence = encoder.encode("----");

        let start = -1;
        let end = buffer.length;
        for (let i = 0; i < buffer.length; i++) {

            if (start === -1) {

                let matchedUniqueString = true;
                let uniqueStringEncodedIndex = 0;

                for (let j = i; j < i + uniqueStringEncoded.length; j++) {
                    if (buffer[j] !== uniqueStringEncoded[uniqueStringEncodedIndex]) {
                        matchedUniqueString = false;
                        break;
                    }
                    uniqueStringEncodedIndex++;
                }

                if (matchedUniqueString) {
                    i = start = i + uniqueStringEncoded.length;
                }
                continue;
            }

            let matchedEndSequence = true;
            let endSequenceIndex = 0;

            for (let j = i; j < i + endSequence.length; j++) {
                if (buffer[j] !== endSequence[endSequenceIndex]) {
                    matchedEndSequence = false;
                    break;
                }
                endSequenceIndex++;
            }

            if (matchedEndSequence) {
                end = i;
                break;
            }

        }

        if (start === -1) return files;

        const fileBuffer = buffer.subarray(start, end);
        const file = new File([fileBuffer], fileName, { type: fileType });

        return { [name]: file, ...files };
    }, {});


    try {
        body = JSON.parse(rawBody);
    } catch (error) {
        if (rawBody.includes(`name="`)) {
            body = (rawBody.match(/name="(.*?)"(\s|\n|\r)*(.*)(\s|\n|\r)*---/gm) || [])
                .reduce((fields: {}, field: string): { [name: string]: string; } => {
                    if (!/name="(.*?)"/.exec(field)?.[1]) return fields;

                    return {
                        ...fields,
                        [/name="(.*?)"/.exec(field)?.[1] || ""]: field.match(/(.*?)(?=(\s|\n|\r)*---)/)?.[0]
                    }
                }, {});
        } else {
            body = Object.fromEntries(new URLSearchParams(rawBody));
        }
    }

    return { body, files };
}