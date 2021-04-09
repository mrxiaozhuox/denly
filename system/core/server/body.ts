/**
 * server.body
 * @author mrxiaozhuox <mrxzx@qq.com>
 */

export interface RequestData {
    key: string,
    value: string,
    other?: Map<string, string>
    type?: string
}

export function getDecoder(url: string) {

    let result: Array<RequestData> = [];

    if (url.includes("?")) {
        let parm: string = url.split("?")[1];
        let parms: Array<string> = parm.split("&");

        parms.forEach((data, index) => {
            let kv = data.split("=");
            result.push({ key: kv[0], value: kv[1], type: "GET" });
        })

    }

    return result;
}


/**
 * postDecoder post提交数据处理器
 * @param body 
 * @param header 
 * @returns {Array<RequestData>}
 */
export function postDecoder(body: Uint8Array, header: Headers): Array<RequestData> {

    if (header.has("content-type")) {
        let ctype = header.get("content-type");

        if (!ctype) {
            return [];
        }

        let charset = ctype.match(/charset="([^]*)"/i);
        let decoder = new TextDecoder(charset ? charset[1] : "utf-8");

        if (/application\/x-www-form-urlencoded/i.test(ctype)) {
            let data = decoder.decode(body);
            let result: RequestData = { key: "", value: "" };

            // 转换数据为键值对
            data.split("&").map((e) => {
                let [k, v] = e.trim().split("=");
                result.key = decodeURIComponent(k);
                result.value = decodeURIComponent(v || "");
            });

            return [result];
        }

        if (/multipart\/form-data; boundary=(.*)/gi.test(ctype)) {

            let data: string = decoder.decode(body);
            let bars = /boundary=(.*)/i.exec(ctype);

            if (!bars) {
                return [];
            }

            let boundary: string = "--" + bars[1];


            let flag: number = 0;

            let result: Array<RequestData> = [];

            let temp: RequestData = { key: "", value: "", other: new Map() };

            data.trim().split("\n").forEach(function (v, i) {

                // Boundary 行自动跳过
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
                        v = v.replace('\r', "");
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

                let reg = /Content-Disposition\: form-data; name\=\"(.*?)\"/i

                // 识别基础数据结构
                if (reg.test(v)) {

                    // 是否为文件上传
                    let file: string = "";

                    let bars = reg.exec(v);

                    if (!bars) {
                        return body;
                    }

                    temp.key = bars[1];

                    // 文件系统读取
                    let filreg = /filename=\"(.*)\"/i
                    if (filreg.test(v)) {
                        file = filreg.exec(v)?.[1] || "";
                        flag = 1;

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
            })

            return result;
        }

        // Json 数据
        if (ctype && /application\/json/i.test(ctype)) {
            let result: Array<RequestData> = [];
            let ctt = decoder.decode(body);

            try {
                let temp: object = JSON.parse(ctt);

                for (let [key, value] of Object.entries(temp)) {
                    result.push({ key: key, value: value, other: new Map() });
                }

            } catch (e) { }

            return result;
        }

        // 普通文本
        if (ctype && ctype.includes("text")) {
            let text = decoder.decode(body);
            return [{ key: "Text", value: text }];
        }

    }

    return [];
}