/**
 * server.body
 * @author mrxiaozhuox <mrxzx@qq.com>
 */

import { EConsole } from "../../support/console.ts";
import { Memory } from "../../library/memory.ts";
import { fileExist } from "../../library/fileSystem.ts";

export interface RequestData {
    key: string;
    value: string;
    other?: Map<string, string>;
    type?: string;
}

export function getDecoder(url: string) {
    const result: Array<RequestData> = [];

    if (url.includes("?")) {
        const parm: string = url.split("?")[1];
        const parms: Array<string> = parm.split("&");

        parms.forEach((data) => {
            const kv = data.split("=");
            result.push({ key: kv[0], value: kv[1], type: "GET" });
        });
    }

    return result;
}

/**
 * postDecoder post提交数据处理器
 * @param body
 * @param header
 * @returns {Array<RequestData>}
 */
export function postDecoder(
    body: Uint8Array,
    header: Headers,
): Array<RequestData> {
    if (header.has("content-type")) {
        const ctype = header.get("content-type");

        if (!ctype) {
            return [];
        }

        const charset = ctype.match(/charset="([^]*)"/i);
        const decoder = new TextDecoder(charset ? charset[1] : "utf-8");

        if (/application\/x-www-form-urlencoded/i.test(ctype)) {
            const data = decoder.decode(body);
            const result: RequestData = { key: "", value: "" };

            // 转换数据为键值对
            data.split("&").map((e) => {
                const [k, v] = e.trim().split("=");
                result.key = decodeURIComponent(k);
                result.value = decodeURIComponent(v || "");
            });

            return [result];
        }

        if (/multipart\/form-data; boundary=(.*)/gi.test(ctype)) {
            const data: string = decoder.decode(body);
            const bars = /boundary=(.*)/i.exec(ctype);

            if (!bars) return [];

            const boundary: string = "--" + bars[1];

            let flag = 0;

            const result: Array<RequestData> = [];

            let temp: RequestData = { key: "", value: "", other: new Map() };

            data.trim().split("\n").forEach(function (v) {
                // Boundary skip
                if (v.trim() == boundary || v.trim() == boundary + "--") {
                    flag = 0;

                    temp.value = temp.value.substring(0, temp.value.length - 2);
                    result.push(temp);

                    temp = { key: "", value: "", other: new Map() };

                    return;
                }

                if (flag == 1) {
                    // 进入 flag 即代表本行内容为文本信息。

                    if (v != "\r") {
                        v = v.replace("\r", "");
                        temp.value += v + "\r\n";
                    }
                } else if (flag == 2) {
                    // 当类型为文件时，则从第二行再开始计算内容
                    flag--;
                    return;
                }

                // 空行自动跳过
                if (v.trim() == "") {
                    return;
                }

                const reg = /Content-Disposition\: form-data; name\=\"(.*?)\"/i;

                // 识别基础数据结构
                if (reg.test(v)) {
                    // 是否为文件上传
                    let file = "";

                    const bars = reg.exec(v);

                    if (!bars) {
                        return body;
                    }

                    temp.key = bars[1];

                    // 文件系统读取
                    const filreg = /filename=\"(.*)\"/i;
                    if (filreg.test(v)) {
                        file = filreg.exec(v)?.[1] || "";
                        flag = 1;

                        temp.type = "FILE";
                        temp.other?.set("filename", file);
                    }

                    flag += 1;
                }
            });

            // 删除为空的数据项
            result.forEach((test, index) => {
                if (test.key == "" || test.value == "") {
                    result.splice(index, 1);
                }
            });

            return result;
        }

        // Json 数据
        if (ctype && /application\/json/i.test(ctype)) {
            const result: Array<RequestData> = [];
            const ctt = decoder.decode(body);

            try {
                const temp = JSON.parse(ctt);

                for (const [key, value] of Object.entries(temp)) {
                    if (typeof value == "string") {
                        result.push({ key: key, value: value, other: new Map() });
                    }
                }
            } catch (error) {
                error;
            }

            return result;
        }

        // get normal text
        if (ctype && ctype.includes("text")) {
            const text = decoder.decode(body);
            return [{ key: "Text", value: text }];
        }
    }

    return [];
}

/**
 * 上传文件缓存
 * 请勿随意手动调用
 */
export function uploadFileTemp(data: RequestData): string {
    let path = "";
    try {
        path = Deno.makeTempFileSync({ prefix: "denly-upload-", suffix: ".temp" });
        const out = new TextEncoder().encode(data.value);
        Deno.writeFileSync(path, out);

        Memory.group("uploadFile");
        const oldInfo = Memory.get(data.key);

        if (oldInfo) {
            const decoder = new TextDecoder();

            const oldFile = JSON.parse(decoder.decode(oldInfo));
            if (fileExist(oldFile.file)) {
                Deno.remove(oldFile.file);
            }
        }

        Memory.set(
            data.key,
            JSON.stringify({
                file: path,
                name: data.other?.get("filename"),
            }),
        );
    } catch (_) {
        EConsole.error("upload file temp error.");
    }

    return path;
}
