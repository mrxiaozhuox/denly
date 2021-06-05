import { serve, Server } from "https://deno.land/std@0.97.0/http/server.ts";
// import { Memory } from "../../library/memory.ts";
import { fileExist } from "../support/fs/filesystem.ts";

interface StartOption {
    debug?: boolean;
}

interface AddrInfo {
    hostname: string;
    port: number;
}

export interface HttpState {
    code: number;
}

export { Server };

export class DenlyHttp {
    public addr: AddrInfo = { hostname: "127.0.0.1", port: 808 };

    public debug = false;
    public serve: Server;

    /**
       *
       */
    constructor(
        host: string,
        port: number,
        options?: StartOption,
    ) {
        this.addr["hostname"] = host;
        this.addr["port"] = port;

        const server: Server = serve({
            hostname: host,
            port: port,
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

const header = new Headers();

interface ReqInfos {
    _args: { [name: string]: string; };
    _form: { [name: string]: string; };
    _file: { [name: string]: File };
    redirect: string;
    error: number;
}

const reqinfo: ReqInfos = {
    _args: {},
    _form: {},
    _file: {},
    redirect: "#", // # 代表不进行重定向（默认）
    error: 200,
};

export class DRequest {
    /**
       * Get 参数获取
       * PS: $_GET
       */
    public args(key: string) {
        if (key in reqinfo._args) {
            return reqinfo._args[key];
        }
        return null;
    }

    /**
       * Post 参数获取
       * PS: $_POST
       */
    public form(key: string) {
        if (key in reqinfo._form) {
            return reqinfo._form[key];
        }
        return null;
    }

    /**
     * upload file
     * @param key 
     * @return file struct
     */
    public file(key: string) {
        if (key in reqinfo._file) {
            return reqinfo._file[key];
        }
        return null;
    }

}

export let Request = new DRequest();

export class DResponse {

    private contentType: { [key: string]: string } = {
        ico: "image/jpg; charset=utf-8",
        jpg: "image/jpg; charset=utf-8",
        png: "image/jpg; charset=utf-8",
        jpeg: "image/jpg; charset=utf-8",
        js: "text/javascript; charset=utf-8",
        css: "text/css; charset=utf-8",
        json: "application/json; charset=utf-8",
        zip: "application/zip; charset=utf-8",
        rar: "application/zip; charset=utf-8",
        pdf: "application/pdf; charset=utf-8",
        text: "text/plain; charset=utf-8",
        html: "text/html; charset=utf-8",
    };

    /**
       * 重定向设置
       */
    public redirect(url: string, cond = true) {
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
        header.set("Content-Type", "application/json; charset=utf-8");
        return JSON.stringify(data);
    }

    /**
       * 返回 文件内容
       */
    public file(file: string, contentType?: string) {
        if (typeof file == "string") {
            if (fileExist(file)) {

                const suffix = file.split(".")[file.split(".").length - 1];

                if (contentType) {
                    this.header("Content-type", contentType);
                } else {
                    if (suffix in this.contentType) {
                        this.header("Content-Type", this.contentType[suffix]);
                    }
                }

                return Deno.readFileSync(file);
            } else {
                throw new Error("file not found");
            }
        }
        return new Uint8Array();
    }

    public abort(code = 404) {
        reqinfo.error = code;
    }

    public status: number = 200;
}

export const Response = new DResponse();

export function httpInit(
    data: {
        args: { [name: string]: string; };
        form: { [name: string]: string; };
        file: { [name: string]: File; };
    },
) {
    reqinfo._args = data.args;
    reqinfo._form = data.form;
    reqinfo._file = data.file;

    // Default Content-Type
    header.set("Content-Type", "text/html; charset=utf-8");
}

interface httpResponse {
    header: Headers;
    redirect: string;
    error: number;
    status: number;
}

export function httpResp(): httpResponse {

    const redirect = reqinfo.redirect;
    const error = reqinfo.error;
    const status = Response.status;

    reqinfo.redirect = "#";
    reqinfo.error = 200;

    Response.status = 200;

    return {
        header: header,
        redirect: redirect,
        error: error,
        status: status,
    };
}
