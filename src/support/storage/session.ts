import {
    Cookie as ICookie,
    getCookies,
    setCookie,
} from "https://deno.land/std@0.97.0/http/cookie.ts";
import {
    Response,
    ServerRequest,
} from "https://deno.land/std@0.97.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.97.0/hash/mod.ts";

import { Memory } from "./memory.ts";

/**
 * core.storage
 * @author mrxiaozhuox <mrxzx@qq.com>
 * 本 Session 系统使用 Denly Memory 程序实现
 */

interface SessionSystem {
    survivalTime: number;
    set(key: string, value: string | Uint8Array): void;
    get(key: string): string | undefined;
    delete(key: string): boolean;
    has(key: string): boolean;
    clean(): boolean;
}

class ESession implements SessionSystem {
    public survivalTime = 120 * 60;

    /**
       * 设置 Session 信息
       */
    public set(key: string, value: string | Uint8Array) {
        Memory.group("Session");
        Memory.set(key, value, this.survivalTime);
    }

    /**
       * 读取 Session 信息
       */
    public get(key: string) {
        // 当数据被访问，则延长过期时间
        Memory.group("Session");

        const data = Memory.get(key);
        if (data) {
            Memory.extend(key, this.survivalTime);

            const decoder = new TextDecoder();
            return decoder.decode(data);
        }
        return undefined;
    }

    /**
       * 删除 Session 信息
       */
    public delete(key: string) {
        Memory.group("Session");
        return Memory.delete(key);
    }

    /**
       * 判断 Session 信息是否存在
       */
    public has(key: string) {
        if (this.get(key)) {
            return true;
        } else {
            return false;
        }
    }

    /**
       * 清空所有 Session 信息
       */
    public clean() {
        Memory.group("Session");
        return Memory.clean("Session");
    }
}

let storage: Array<ICookie> = [];
let loader: Map<string, string> = new Map();

class ECookie {
    public set(key: string, value: string, options?: {
        expires?: Date;
        maxAge?: number;
        domain?: string;
        path?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: "Strict" | "Lax" | "None";
        unparsed?: string[];
    }) {
        let data = { name: key, value: value, ...options };

        storage.push(data);
    }

    /**
       * 读取数据
       */
    public get(key: string) {
        return loader.get(key);
    }

    /**
       * 数据是否存在
       */
    public has(key: string) {
        if (this.get(key)) {
            return true;
        }

        return false;
    }

    /**
       * 删除 Cookie
       */
    public delete(key: string) {
        this.set(key, "", {
            expires: new Date(0),
        });
    }
}

/** Session Manager */
export const Session: SessionSystem = new ESession();

/** Cookie Manager */
export const Cookie = new ECookie();

/** bindCokkie to Response */
export function bindCookie(response: Response) {
    storage.forEach((c) => {
        setCookie(response, c);
    });

    const denlyid = createHash("md5").update(new Date().getTime() + "@DENLYID")
        .toString();
    setCookie(response, { name: "DENLYID", value: denlyid });
}

/** loadCookie from request */
export function loadCookie(request: ServerRequest) {
    const cookies = getCookies(request);
    const result = JSON.parse(JSON.stringify(cookies));

    for (const key in result) {
        loader.set(key, result[key]);
    }
}
