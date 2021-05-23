// Copyright 2020-2021 the mrxiaozhuox. All rights reserved. MIT license

/**
 * Denly Framework
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @abstract Denly Framework
 * @license MIT License
 * @link https://denly.mrxzx.info/
 */

// Deno std library [Server]
import { ServerRequest } from "https://deno.land/std@0.92.0/http/server.ts";
import { readAll } from "https://deno.land/std@0.97.0/io/util.ts";

// Denly Server Methods
import {
    DenlyHttp,
    HttpState,

    Request,
    Response,
    DRequest,
    DResponse,

    httpInit,
    httpResp,
} from "./server/http.ts";
import { getDecoder, postDecoder, RequestData } from "./server/body.ts";

// Denly Storage Manager
import { bindCookie, loadCookie } from "./storage.ts";

// Denly Support
import { colorTab, EConsole } from "../support/console.ts";

// Denly Router
import { RouteController, Router } from "../core/router.ts";

// Denly Memory
import { Memory } from "../library/memory.ts";

// Denly Others
import { _dirname, _version, Watcher } from "../mod.ts";


/**
 * Denly app structure options.
 * @interface
 */
export interface DeOption {
    hostname: string;
    port: number;
    options?: {
        debug?: boolean;
    };
}

/**
 * Denly config options
 * @interface
 */
interface DeConfig {
    storage: {
        log: string;
        template: string;
    };
    memory: {
        interval: number;
    };
}

/**
 * Denly main object.
 * @public
 */
export class Denly {

    /**
     * @description DConfig
     */
    public config: DeConfig = {
        storage: {
            log: _dirname + "/runtime/log",
            template: _dirname + "/template",
        },
        memory: {
            interval: 300 * 1000,
        },
    };

    /**
       * @description router shortcut
       */
    public route = Router;

    /**
       * @description http-server object
       */
    private http: DenlyHttp;

    /**
       * @description Denly server options (use to reload)
       */
    public deop: DeOption;

    /**
       * @description request object
       */
    public request: DRequest = Request;

    /**
       * @description response object
       */
    public response: DResponse = Response;

    /**
       * @description The old object after the restart
       */
    private deprecated: DenlyHttp | null = null;

    constructor(options?: DeOption, http?: DenlyHttp) {
        this.deop = { hostname: "0.0.0.0", port: 808, options: { debug: false } };

        if (http) {
            this.http = http;
        } else {
            if (options) {
                this.deop = options;
                this.http = new DenlyHttp(
                    options.hostname,
                    options.port,
                    options.options,
                );
            } else {
                this.http = new DenlyHttp("0.0.0.0", 808, { debug: false });
            }
        }

        Watcher.app = this;

        if (this.deop.options?.debug) {
            Watcher.listen();
        }

        Memory.loader();
    }

    /**
       * Denly.proxy [func]
       * proxy the request (private method)
       */
    public async proxy(request: ServerRequest): Promise<HttpState> {
        let status = 200;

        const sections: Array<string> = pathParser(request.url); // 路径解析

        let args: Array<RequestData> = [];
        let form: Array<RequestData> = [];

        let context: Uint8Array | Deno.Reader | string = "";

        loadCookie(request); // 读取存在的 Cookie

        // 除去 GET 请求才支持 FormData, Urlencoded, Raw, File 等提交
        if (request.method == "GET") {
            args = getDecoder(request.url);
        } else {
            const origin: Uint8Array = await readAll(request.body);
            form = postDecoder(origin, request.headers);
        }

        // Request 数据绑定（用于 Request 数据获取）
        httpInit({ args, form });

        // 路由解析器
        const target = RouteController.processer(sections, request.method);

        if (target) {
            if (typeof target.route == "function") {

                // Default Header [Content-Type]
                if (target.other?.method == "ANY" || target.other?.method == "GET") {
                    this.response.header("Content-Type", "text/html;charset=utf-8");
                } else {
                    this.response.header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
                }

                try {
                    // exec controller
                    context = await target.route(...target.parms);

                } catch (error) {
                    if (typeof error == "number") {
                        status = error;
                    } else {
                        status = 500;
                    }
                }
            }
        } else { status = 404; }

        const resp = httpResp();

        // Redirect 处理器（重定向）
        if (resp.redirect != "#" && resp.redirect != "") {
            const header: Headers = new Headers();
            header.set("Location", resp.redirect);
            request.respond({ status: 301, body: "", headers: header });
        }

        let result = {
            status: status,
            body: context,
            headers: resp.header,
        };

        // Error
        if (resp.error != 200 || status != 200) {
            if (status == 200) status = resp.error;
            result = RouteController.httpError(status);
        }

        // 将框架 Cookie 绑定至程序
        bindCookie(result);

        // 返回最终结果
        request.respond(result);

        return { code: status };
    }

    /**
       * Denly.run [func]
       * start the application
       * loop to listening request
       */
    public async run() {
        const http: DenlyHttp = this.http;

        const host: string = http.addr["hostname"];
        const port: number = http.addr["port"];

        // const server: Server = http.serve;

        // server information display
        const path = colorTab.Blue + "http://" + host + ":" + port + colorTab.Clean;
        EConsole.blank();
        EConsole.info(`Denly Server ${path} started！`);
        if (http.debug) {
            EConsole.warn("Debug mode enabled (for development environment only)");
        }
        EConsole.blank();

        Memory.listener({ interval: this.config.memory.interval, http: this.http });

        for await (const request of http.serve) {
            this.proxy(request).then(({ code }) => {
                Denly.reqinfo(request, code); // 请求数据渲染
            });
        }
    }

    /**
       * Denly.reload [func]
       * restart the denly server
       */
    public reload() {
        this.http.serve.close();

        this.deprecated = this.http;

        setTimeout(() => {
            this.http = new DenlyHttp(
                this.deop.hostname,
                this.deop.port,
                this.deop.options,
            );

            this.run();
        }, 800);
    }

    /**
       * Denly.reqinfo [func]
       * display the request info
       */
    private static reqinfo(r: ServerRequest, code: number): void {
        let status = "";
        if (code == 200) {
            status = colorTab.Green + code + colorTab.Clean;
        } else {
            status = colorTab.Red + code + colorTab.Clean;
        }

        const message = `${r.proto}: ${r.method} - ${r.url} ${status}`;
        EConsole.info(message);
    }
}

/**
 * Function: pathParser
 * parse the url
 */
export function pathParser(url: string) {
    if (url.includes("?")) {
        url = url.split("?")[0];
    }

    let sections = url.split("/").filter((s) => s != "");

    if (sections.length < 1) {
        sections = ["_PATH_ROOT_"];
    }

    return sections;
}
