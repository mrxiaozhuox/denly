/**
 * System.Tools
 * 快捷引入一些常用功能和函数
 */

interface consInfo {
    rootPath: string
}

/** Denly Const Info */
export const DCons: consInfo = {
    rootPath: (Deno.mainModule).substring(0, Deno.mainModule.lastIndexOf("/") + 1).substr(8),
};

export { Router } from "./core/router.ts";
export { Request, Response } from "./core/server/http.ts";
export { HttpError } from "./support/error.ts";
export { EConsole } from "./support/console.ts";