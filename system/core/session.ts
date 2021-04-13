import { dirCheck } from "../library/fileSystem.ts";
import { DCons } from "../tools.ts";
import { Memory } from "../library/memory.ts";

/**
 * core.session
 * @author mrxiaozhuox <mrxzx@qq.com>
 * 本 Session 系统使用 Denly Memory 程序实现
 */

interface SessionSystem {
    survivalTime: number,
    set(key: string, value: string | Uint8Array): void,
    get(key: string): string | undefined,
    delete(key: string): boolean,
    has(key: string): boolean,
    clean(): boolean,
}

class ESession implements SessionSystem {

    public survivalTime = 30 * 60;

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

export let Session: SessionSystem = new ESession();