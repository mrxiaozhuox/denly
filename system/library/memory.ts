/**
 * support.memory
 * @author mrxiaozhuox <mrxzx@qq.com>
 */
import { DenlyHttp } from "../core/server/http.ts";
import { dirExist, dirCheck } from "./fileSystem.ts";

import { DCons, EConsole } from "../tools.ts";

interface memoryStruct {
    value: Uint8Array,
    expire?: number,
    persistence?: {
        path: string,
        useable: boolean,
        time: number
    }
}

interface memoryGroup {
    memorys: Map<symbol, memoryStruct>,
    status: number
}

interface listenerOption {
    interval: number
}

type mkey = symbol | string | number;

/**
 * EMemory: Memory Cache
 * 
 * EMemory 主要为 Denly 提供缓存服务！
 * Session、FileTemp 等都将基于本程序开发！
 */
export class EMemory {

    private memorys: Map<symbol, memoryGroup> = new Map();

    private thisGroup: symbol;
    private memoryPath: string = DCons.rootPath + "/runtime/memory";

    constructor() {
        this.thisGroup = Symbol("default");

        if (!dirCheck(DCons.rootPath + "/runtime/memory/")) {
            EConsole.error("Directory init error. [ runtime/memory ]");
            Deno.exit(5);
        }
    }

    /**
     * 切换当前 Group
     */
    public group(symbol: mkey): void {
        if (typeof symbol == "string" || typeof symbol == "number") {
            symbol = Symbol(symbol);
        }

        this.thisGroup = symbol;
    }

    public set(key: mkey, value: string | Uint8Array | Deno.Reader) {
        if (typeof key == "string" || typeof key == "number") {
            key = Symbol(key);
        }
    }

    /**
     * Denly Memory 触发器（监听器）
     * 用于对数据进行持久化和更新监听
     */
    public async listener(options: listenerOption) {
        this.persistenceAll();
        setInterval(() => {
            this.persistenceAll();
        }, options.interval);
    }

    /**
     * 将目前已存在的数据全部持久化
     * PS: 拒绝持久化的数据会被过滤
     */
    public async persistenceAll() {
        let memorys = this.memorys;

        for (const [name, group] of memorys.entries()) {

            if (group.status == 2) { continue; } // status 为 2 则不进行持久化

            // 遍历群组中的每一条数据
            for (const [symbol, memory] of group.memorys) {

                // 持久化是否支持
                if (!memory.persistence || !memory.persistence.useable) { continue; } 4

                const filename: string = symbol.toString();

            }

        }

    }

}

export let Memory = new EMemory();