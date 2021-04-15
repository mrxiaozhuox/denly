/**
 * System.Tools
 * 快捷引入一些常用功能和函数
 */

interface consInfo {
    rootPath: string
}

/** Denly Const Info */
export const DConst: consInfo = {
    rootPath: (Deno.mainModule).substring(0, Deno.mainModule.lastIndexOf("/") + 1).substr(8),
};

/** Router 操作 */
export { Router } from "./core/router.ts";

/** Request Response 操作 */
export { Request, Response } from "./core/server/http.ts";

/** HttpError 操作 */
export { HttpError } from "./support/error.ts";

/** EConsole 操作 */
export { EConsole } from "./support/console.ts";

/** Memory 操作 */
export { Memory } from "./library/memory.ts";

/** Session Cookie 操作 */
export { Session, Cookie } from "./core/storage.ts";