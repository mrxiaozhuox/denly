import { pathParser } from "./denly.ts";

import { DRequest, DResponse } from "./server/http.ts";
import { Request, Response } from "./server/http.ts";

/**
 * core.router
 * @author mrxiaozhuox <mrxzx@qq.com>
 */

interface ruleOption {
    method: string
}

type Controller = (req: DRequest, resp: DResponse, parms: object) => any;
type ErrorContrl = () => { header: Headers, body: string | Uint8Array };

// 路由信息
let _routers: Map<string, Controller> = new Map();
let _optinfo: Map<string, ruleOption> = new Map();

// Error 渲染器
let _errors: Map<number, ErrorContrl> = new Map();

// RegExp 信息
let _reginfo: Map<string, RegExp> = new Map();

class RouteManager {

    /**
     * 路由注册函数 Rule 
     */
    public rule(path: string, controller: Controller, options?: ruleOption): RouteManager {

        _routers.set(path, controller);

        if (options == undefined) {
            options = { method: "ANY" };
        }

        _optinfo.set(path, options);

        return this;
    }

    public regex(sign: string, regex: RegExp): RouteManager {
        _reginfo.set(sign, regex);
        return this;
    }

    /**
     * Get 路由注册（简洁）
     */
    public get(path: string, controller: Controller): RouteManager {
        return this.rule(path, controller, {
            method: "GET"
        });
    }

    /**
     * Post 路由注册（简洁）
     */
    public post(path: string, controller: Controller): RouteManager {
        return this.rule(path, controller, {
            method: "POST"
        });
    }

    /**
     * 绑定 Error 控制器
     */
    public fallback(code: number | Array<number>, controller: ErrorContrl): RouteManager {

        if (typeof code == "object") {
            code.forEach(element => {
                _errors.set(element, controller);
            });
        } else {
            _errors.set(code, controller);
        }

        return this;
    }

}

export let Router: RouteManager = new RouteManager()
    // 系统自带匹配项（字母、数字、邮箱、电话、日期 ...）
    .regex("letter", /^[a-zA-Z]+$/g)
    .regex("number", /^[0-9]*$/g)
    .regex("email", /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g)
    .regex("phone", /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/g)
    .regex("date", /^\d{4}-\d{1,2}-\d{1,2}/g)
    ;

/**
 * 内部对象，请勿随意调用
 */
export class RouteController {

    /**
     * sections 为调用路径
     * esc      为当前遍历到的路由路径
     */

    public static processer(sections: Array<string>, method: string) {

        let result: string = "";
        let parms: Array<String> = [];

        _routers.forEach((value, key) => {

            if (result != "") { return null; } // 已经找到匹配结果则跳过查找

            // 访问类型判定（类型不同直接跳过）
            let need_method = _optinfo?.get(key)?.method || "ANY";

            if (need_method != method && need_method != "ANY") {
                return null;
            }


            let flag: boolean = false;

            let esc: Array<string> = pathParser(key);


            if (sections.length < esc.length) {
                return null;
            }

            esc.forEach((node, index) => {

                if (flag) { return; }

                // 判断是否为 Regex
                if (node.substr(0, 1) == ":") {
                    let sign = node.slice(1);
                    if (_reginfo.has(sign)) {
                        let regex = _reginfo.get(sign);
                        if (!regex) { return null; }


                        if (regex.test(sections[index])) {
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

            if (!flag) { result = key; }
        });

        if (result != "") {

            return {
                route: _routers.get(result),
                other: _optinfo.get(result),
                parms: parms
            };

        } else {
            return null;
        }
    }

    /**
     * 返回 httpError 结果
     */
    public static httpError(code: number): { status: number, body: Uint8Array, headers: Headers } {

        const encoder = new TextEncoder();

        let header = new Headers();
        let context: Uint8Array = new Uint8Array();

        // 检查 Error 是否存在
        const controller = _errors.get(code);
        if (controller) {
            let result = controller();
            header = result.header;
            let data = result.body;

            if (typeof data == "string") {
                context = encoder.encode(data);
            } else {
                context = data;
            }
        }

        return {
            status: code,
            body: context,
            headers: header
        };
    }

    /**
     * 获取路由数据信息
     */
    public static list() {
        return [_routers, _optinfo, _errors];
    }
}