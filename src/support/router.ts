import { pathParser } from "./denly.ts";
import { dirExist, fileExist } from "../support/filesystem.ts";
import { _separator } from "./constant.ts";
import { Response } from "./server/http.ts";

/**
 * core.router
 * @author mrxiaozhuox <mrxzx@qq.com>
 */

interface ruleOption {
    method: string;
}

type Controller = (...parms: string[]) => any;
type ErrorContrl = () => { header: Headers; body: string | Uint8Array };

// 路由信息
const _routers: Map<string, Controller> = new Map();
const _optinfo: Map<string, ruleOption> = new Map();

// Error 渲染器
const _errors: Map<number, ErrorContrl> = new Map();

// RegExp 信息
const _reginfo: Map<string, RegExp> = new Map();

// Resource Information
const _resource: Map<string, string> = new Map();

/**
 * RouteManager [obj]
 * Route Manager
 */
class RouteManager {
    /**
       * @name rule
       * @param {string} path
       * @param {Controller} controller
       * @param {ruleOption} options
       * @returns {RouteManager} RouteManager
       */
    public rule(
        path: string,
        controller: Controller,
        options?: ruleOption,
    ): RouteManager {

        if (options == undefined) {
            options = { method: "ANY" };
        }

        _routers.set(options.method + "@" + path, controller);

        _optinfo.set(options.method + "@" + path, options);

        return this;
    }

    /**
       * @name regex
       * @param {string} sign
       * @param {RegExp} regex
       * @returns {RouteManager} RouteManager
       */
    public regex(sign: string, regex: RegExp): RouteManager {
        _reginfo.set(sign, regex);
        return this;
    }

    /**
       * @name get
       * @param {string} path
       * @param {Controller} controller
       * @returns {RouteManager} RouteManager
       */
    public get(path: string, controller: Controller): RouteManager {
        return this.rule(path, controller, {
            method: "GET",
        });
    }

    /**
       * @name post
       * @param {string} path
       * @param {Controller} controller
       * @returns {RouteManager} RouteManager
       */
    public post(path: string, controller: Controller): RouteManager {
        return this.rule(path, controller, {
            method: "POST",
        });
    }

    /**
       * @name fallback
       * @param {number | Array<number>} code
       * @param {ErrorContrl} controller
       * @returns {RouteManager} RouteManager
       */
    public fallback(
        code: number | Array<number>,
        controller: ErrorContrl,
    ): RouteManager {
        if (typeof code == "object") {
            code.forEach((element) => {
                _errors.set(element, controller);
            });
        } else {
            _errors.set(code, controller);
        }

        return this;
    }

    /**
       * @name resource
       * @param {string} url
       * @param {string} path
       *
       * @returns {RouteManager} RouteManager
       */
    public resource(url: string, path: string): RouteManager {
        _resource.set(url, path);

        return this;
    }
}

export const Router: RouteManager = new RouteManager()
    // 系统自带匹配项（字母、数字、邮箱、电话、日期 ...）
    .regex("letter", /^[a-zA-Z]+$/g)
    .regex("number", /^[0-9]*$/g)
    .regex("email", /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g)
    .regex(
        "phone",
        /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/g,
    )
    .regex("date", /^\d{4}-\d{1,2}-\d{1,2}/g);

/**
 * 内部对象，请勿随意调用
 */
export class RouteController {
    /**
       * sections 为调用路径
       * esc      为当前遍历到的路由路径
       */

    public static processer(sections: Array<string>, method: string) {
        let result = "";
        const parms: Array<string> = [];

        _routers.forEach((_, key) => {
            if (result != "") return null; // 已经找到匹配结果则跳过查找

            // 访问类型判定（类型不同直接跳过）
            const needMethod = _optinfo?.get(key)?.method || "ANY";

            if (needMethod != method && needMethod != "ANY") {
                return null;
            }

            let flag = false;

            if (key.includes("@")) {
                const temp = key.split("@");
                temp.shift();
                key = temp.join("@");
            }

            const esc: Array<string> = pathParser(key);

            if (sections.length < esc.length) {
                return null;
            }

            esc.forEach((node, index) => {
                if (flag) return;

                // 判断是否为 Regex
                if (node.substr(0, 1) == ":") {
                    const sign = node.slice(1);
                    if (_reginfo.has(sign)) {
                        const regex = _reginfo.get(sign);
                        if (!regex) return null;

                        if (!regex.test(sections[index])) {
                            flag = true; // 匹配错误，终止匹配
                        } else {
                            parms.push(sections[index]);
                        }
                        regex.lastIndex = 0;
                    }
                } else {
                    if (sections[index] != node) {
                        flag = true; // 匹配错误，终止匹配
                    }
                }
            });

            if (!flag) result = key;
        });

        if (result != "") {
            result = method + "@" + result;
            return {
                route: _routers.get(result),
                other: _optinfo.get(result),
                parms: parms,
            };
        } else {

            // check the resource list
            let isres = "";

            _resource.forEach((path, url) => {
                const esc: Array<string> = pathParser(url);
                let temp: string = path + _separator;
                let flag = true;

                for (const index in sections) {
                    if (sections[index] == esc[index]) {
                        continue;
                    }

                    if (dirExist(temp + sections[index] + _separator)) {
                        temp += sections[index] + _separator;
                    } else if (fileExist(temp + sections[index])) {
                        temp += sections[index];
                    } else {
                        flag = false;
                        break;
                    }
                }

                if (flag && fileExist(temp)) {
                    isres = temp;
                }
            });

            // Static resource request
            if (isres != "") {
                return {
                    route: (path: string) => {
                        try {
                            if (fileExist(path)) {

                                const tab: { [key: string]: string } = {
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

                                const suffix = path.substring(path.lastIndexOf(".") + 1);

                                if (suffix in tab) {
                                    Response.header("Content-type", tab[suffix]);
                                } else {
                                    Response.header("Content-type", "text/html; charset=utf-8");
                                }
                                const decoder = new TextDecoder();

                                if (tab[suffix] != "image/jpg; charset=utf-8") {
                                    return decoder.decode(Deno.readFileSync(path));
                                } else {
                                    return Deno.readFileSync(path);
                                }
                            } else {
                                Response.abort(404);
                            }
                        } catch (_) {
                            return Response.abort(404);
                        }
                    },
                    other: { method: "ANY" },
                    parms: [isres],
                };
            }

            return null;
        }
    }

    /**
       * 返回 httpError 结果
       */
    public static httpError(
        code: number,
    ): { status: number; body: Uint8Array; headers: Headers } {
        const encoder = new TextEncoder();

        let header = new Headers();
        let context: Uint8Array = new Uint8Array([]);

        // 检查 Error 是否存在
        const controller = _errors.get(code);
        if (controller) {
            const result = controller();
            header = result.header;
            const data = result.body;

            if (typeof data == "string") {
                context = encoder.encode(data);
            } else {
                context = data;
            }
        }

        return {
            status: code,
            body: context,
            headers: header,
        };
    }

    /**
       * 获取路由数据信息
       */
    public static list() {
        return [_routers, _optinfo, _errors, _resource];
    }
}
