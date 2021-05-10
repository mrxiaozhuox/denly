import { serve, Server } from "https://deno.land/std@0.92.0/http/server.ts";
import { RequestData } from "./body.ts";
import { Memory } from "../../library/memory.ts";
import { fileExist } from "../../library/fileSystem.ts";

interface StartOption {
    debug?: boolean
}

interface AddrInfo {
    hostname: string,
    port: number
}

export interface HttpState {
    code: number
}

export { Server };

export class DenlyHttp {

    public addr: AddrInfo = { hostname: "127.0.0.1", port: 808 };

    public debug: boolean = false;
    public serve: Server;

    /**
     *
     */
    constructor(
        host: string,
        port: number,
        options?: StartOption
    ) {

        this.addr['hostname'] = host;
        this.addr['port'] = port;

        const server: Server = serve({
            hostname: host,
            port: port
        });

        if (options !== undefined) {
            // 存在特殊配置
            if (options.debug !== undefined) {
                this.debug = options.debug;
            } else {
                this.debug = false;
            }
        }

        this.serve = server;

    }
}

let header = new Headers();

interface ReqInfos {
    _args: Array<RequestData>,
    _form: Array<RequestData>,
    redirect: string,
    error: number
}

let reqinfo: ReqInfos = {
    _args: [],
    _form: [],
    redirect: "#", // # 代表不进行重定向（默认）
    error: 200
};

export class DRequest {

    /**
     * Get 参数获取
     * PS: $_GET
     */
    public args(key: string) {

        let info: RequestData | undefined;
        try {
            reqinfo._args.forEach(element => {
                if (element.key == key) {
                    info = element;
                    throw new Error(); // 跳出循环
                }
            });
        } catch (error) { }

        if (info) {
            return decodeURI(info.value);
        }
        return null;

    }

    /**
     * Post 参数获取
     * PS: $_POST
     */
    public form(key: string) {
        let info: RequestData | undefined;
        try {
            reqinfo._form.forEach(element => {
                if (element.key == key) {
                    info = element;
                    throw new Error(); // 跳出循环
                }
            });
        } catch (error) { }

        if (info) {
            return info.value;
        }
        return null;
    }
}

export let Request = new DRequest();

export class DResponse {

    /**
     * 重定向设置 
     */
    public redirect(url: string, cond: boolean = true) {
        if (cond) {
            reqinfo.redirect = url;
        } else {
            reqinfo.redirect = "#";
        }
    }

    /**
     * 设置 Header
     */
    public header(key: string, value: string, append?: boolean) {
        if (append) {
            header.append(key, value);
        } else {
            header.set(key, value);
        }
    }

    /**
     * 返回 Json 代码
     */
    public json(data: object) {
        header.set("Content-Type", "application/json");
        return JSON.stringify(data);
    }

    /**
     * 返回 文件内容
     */
    public file(file: string) {
        if (typeof file == "string") {
            if (fileExist(file)) {
                return Deno.readFileSync(file);
            } else {
                throw new Error("file not found");
            }
        }
        return new Uint8Array();
    }

    public abort(code: number = 404) {
        reqinfo.error = code;
    }

}

export let Response = new DResponse();

export function httpInit(data: { args: Array<RequestData>, form: Array<RequestData> }) {
    reqinfo._args = data.args;
    reqinfo._form = data.form;
}

interface httpResponse {
    header: Headers,
    redirect: string,
    error: number
}

export function httpResp(): httpResponse {

    let redirect = reqinfo.redirect;
    let error = reqinfo.error;

    reqinfo.redirect = "#";
    reqinfo.error = 200;

    return {
        header: header,
        redirect: redirect,
        error: error
    };
}