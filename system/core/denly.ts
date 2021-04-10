// Copyright 2020-2021 the mrxiaozhuox. All rights reserved. MIT license

/**
 * Denly Framework
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @abstract Denly Framework
 */

import { ServerRequest } from "https://deno.land/std@0.92.0/http/server.ts";

import { Server, DenlyHttp, HttpState } from "./server/http.ts";
import { httpInit, httpResp } from "./server/http.ts";

import { EConsole, colorTab } from "../support/console.ts";
import { postDecoder, getDecoder, RequestData } from "./server/body.ts";

export { Request, Response } from "./server/http.ts";

import { Router, RouteController } from '../core/router.ts';

export interface DeOption {
    hostname: string,
    port: number,
    options: {
        debug?: boolean
    }
}

interface DeConfig {
    storage: {
        temp?: string,
        cache?: string,
        log?: string,
        template?: string
    }
}

export class Denly {

    public config: DeConfig = { storage: {} };

    private http: DenlyHttp;

    constructor(options?: DeOption, http?: DenlyHttp) {

        if (http) {
            this.http = http;
        } else {
            if (options) {
                this.http = new DenlyHttp(
                    options.hostname,
                    options.port,
                    options.options
                );
            } else {
                this.http = new DenlyHttp('0.0.0.0', 808, { debug: false });
            }
        }
    }

    /**
     * 数据请求处理
     */
    public async proxy(request: ServerRequest): Promise<HttpState> {

        let status: number = 200;

        let sections: Array<string> = pathParser(request.url); // 路径解析

        let args: Array<RequestData> = [];
        let form: Array<RequestData> = [];

        let context: Uint8Array | Deno.Reader | string = "";

        // 除去 GET 请求才支持 FormData, Urlencoded, Raw, File 等提交
        if (request.method == "GET") {
            args = getDecoder(request.url);
        } else {
            const origin: Uint8Array = await Deno.readAll(request.body);
            form = postDecoder(origin, request.headers);
        }

        // Request
        httpInit({ args, form });

        let target = RouteController.processer(sections, request.method);

        if (target) {
            if (typeof target.route == "function") {
                try {
                    context = target.route(...target.parms);
                } catch (error) {
                    if (error?._httperror) {
                        status = error?.code || 500;
                    } else {
                        status = 500;
                    }
                }
            }
        } else {
            status = 404;
        }

        let resp = httpResp();

        if (resp.redirect != "#" && resp.redirect != "") {
            let header: Headers = new Headers();
            header.set("Location", resp.redirect);
            request.respond({ status: 301, body: "", headers: header });
        }

        // 返回最终结果
        request.respond({
            status: status,
            body: context,
            headers: resp.header
        });

        return { code: status };
    }

    public async run() {

        let http: DenlyHttp = this.http;

        let host: string = http.addr['hostname'];
        let port: number = http.addr['port'];

        let server: Server = http.serve;

        let path = colorTab.Blue + "http://" + host + ':' + port + colorTab.Clean;

        EConsole.blank();
        EConsole.info(`HTTP Server ${path} 已启动！`);

        if (http.debug) {
            EConsole.warn("开启了 Debug 模式（仅用于开发环境）");
        }
        EConsole.blank();

        for await (const request of http.serve) {
            this.proxy(request).then(({ code }) => {
                Denly.reqinfo(request, code); // 请求数据渲染
            });
        }
    }

    private static reqinfo(r: ServerRequest, code: number): void {

        let status: string = "";
        if (code == 200) {
            status = colorTab.Green + code + colorTab.Clean;
        } else {
            status = colorTab.Red + code + colorTab.Clean;
        }

        let message: string = `${r.proto}: ${r.method} - ${r.url} ${status}`;
        EConsole.info(message);
    }
}

/**
 * 访问 URL 解析程序
 */
export function pathParser(url: string) {
    if (url.includes("?")) {
        url = url.split("?")[0];
    }

    let sections = url.split("/").filter(s => s != "");

    if (sections.length < 1) {
        sections = ["_PATH_ROOT_"];
    }

    return sections;
}

function Uint8ArrayToString(data: Uint8Array) {
    var dataString = "";
    for (var i = 0; i < data.length; i++) {
        dataString += String.fromCharCode(data[i]);
    }

    return dataString;
}