import { serve, Server } from "https://deno.land/std@0.92.0/http/server.ts";
import { RequestData } from "./body.ts";
import { Memory } from "../../library/memory.ts";

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


interface ReqInfos {
    _args: Array<RequestData>,
    _form: Array<RequestData>,
    redirect: string
}

let reqinfo: ReqInfos = {
    _args: [],
    _form: [],
    redirect: "#" // # 代表不进行重定向（默认）
};

class DRequest {

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

class DResponse {

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
}

export let Response = new DResponse();

export function httpInit(data: { args: Array<RequestData>, form: Array<RequestData> }) {
    reqinfo._args = data.args;
    reqinfo._form = data.form;
}

interface httpResponse {
    header: Headers,
    redirect: string
}

export function httpResp(): httpResponse {
    let header = new Headers();

    let redirect = reqinfo.redirect;

    reqinfo.redirect = "#";

    return {
        header: header,
        redirect: redirect
    };
}