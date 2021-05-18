/**
 * support.memory
 * @author mrxiaozhuox <mrxzx@qq.com>
 */
import { _dirname } from "../mod.ts";

import { createHash } from "https://deno.land/std@0.92.0/hash/mod.ts";

import { DenlyHttp } from "../core/server/http.ts";
import { dirCheck, fileExist } from "./fileSystem.ts";

import { EConsole } from "../support/console.ts";

import { _tempdir } from "./constant.ts";

interface memoryStruct {
  value: Uint8Array;
  expire?: number;
  persistence: {
    path: string;
    usable: boolean;
    time: number;
  };
}

interface memoryGroup {
  memorys: Map<string, memoryStruct>;
  status: number;
}

interface listenerOption {
  interval: number;
  http: DenlyHttp;
}

const encoder = new TextEncoder();

/**
 * Memory [obj]
 *
 * EMemory 主要为 Denly 提供缓存服务！
 * Session、FileTemp 等都将基于本程序开发！
 */
export class EMemory {
  private memorys: Map<string, memoryGroup> = new Map();

  private thisGroup: string;
  private memoryPath: string;

  constructor() {
    this.thisGroup = "default";
    this.memoryPath = _tempdir + "/Denly/runtime/memory/";

    if (!dirCheck(this.memoryPath)) {
      EConsole.error("Directory init error. [ Memory Temp ]");
      Deno.exit(5);
    }
  }

  /**
     * 切换当前 Group
     * 第二位参数可以关闭 Group 的持久化功能
     */
  public group(key: string, persistence = true): void {
    this.thisGroup = key;

    let status = 0;
    if (!persistence) status = 2; // 可以关闭持久化功能

    const mem = this.memorys.get(key);

    if (mem) {
      mem.status = status;
    } else {
      const memTemp = {
        memorys: new Map(),
        status: status,
      };

      this.memorys.set(key, memTemp);
    }
  }

  /**
     * 添加（设置） Memory
     */
  public set(key: string, value: string | Uint8Array, expire?: number) {
    let memTemp = this.memorys.get(this.thisGroup);

    if (typeof value == "string") {
      value = encoder.encode(value);
    }

    if (expire) {
      expire = new Date().getTime() + (expire * 1000);
    } else {
      expire = 0;
    }

    if (!memTemp) {
      memTemp = {
        memorys: new Map(),
        status: 0,
      };
    }

    memTemp.memorys.set(key, {
      value: value,
      expire: expire,
      persistence: {
        path: "unknown",
        usable: true,
        time: 0,
      },
    });

    this.memorys.set(this.thisGroup, memTemp);
  }

  /**
     * 读取 Memory 数据
     */
  public get(key: string) {
    const memTemp = this.memorys.get(this.thisGroup);

    if (!memTemp) return undefined;

    if (this.overdue(key)) return undefined;

    return memTemp.memorys.get(key)?.value;
  }

  /**
     * 删除 Memory 数据
     */
  public delete(key: string) {
    const hash = createHash("md5");
    hash.update(this.thisGroup + "@" + key);
    const filename = "M@0" + hash.toString();

    if (fileExist(this.memoryPath + filename + ".dat")) {
      try {
        Deno.remove(this.memoryPath + filename + ".dat");
        Deno.remove(this.memoryPath + filename + ".idx");
      } catch (error) {
        error;
      }
    }

    const memTemp = this.memorys.get(this.thisGroup);

    if (!memTemp) return true;

    return memTemp.memorys.delete(key);
  }

  /**
     * 检查 Memory 是否过期
     */
  public overdue(key: string) {
    const memTemp = this.memorys.get(this.thisGroup);

    if (!memTemp) return true;

    const data = memTemp.memorys.get(key);
    if (!data) return true;

    if (!data.expire) data.expire = 0;

    if (data.expire > new Date().getTime() || data.expire == 0) {
      return false;
    }

    this.delete(key);
    return true;
  }

  /**
     * 延长过期时间
     */
  public extend(key: string, expire: number) {
    const memTemp = this.memorys.get(this.thisGroup);

    if (!memTemp) return false;

    const data = memTemp.memorys.get(key);
    if (data) {
      data.expire = new Date().getTime() + (expire * 1000);
      return true;
    }

    return false;
  }

  /**
     * 清空当前所有 Memory 数据
     */
  public clean(group?: string) {
    if (!group) {
      this.memorys = new Map();
      try {
        for (const file of Deno.readDirSync(this.memoryPath)) {
          Deno.removeSync(this.memoryPath + file.name);
        }
      } catch {
        return false;
      }
      return true;
    }

    const tempGroup = this.thisGroup;

    this.thisGroup = group;

    for (const file of Deno.readDirSync(this.memoryPath)) {
      const fileSec = file.name.split(".");

      const filename = fileSec[0];
      const suffix = fileSec[1];

      if (suffix == "dat") continue;

      let info = {
        expire: 0,
        checker: "",
        symbol: "",
      };

      const decoder = new TextDecoder();

      info = JSON.parse(
        decoder.decode(Deno.readFileSync(this.memoryPath + filename + ".idx")),
      );

      if (info.symbol.split(".")[0] == group) {
        try {
          Deno.removeSync(this.memoryPath + filename + ".dat");
          Deno.removeSync(this.memoryPath + filename + ".idx");
        } catch (error) {
          error;
        }

        this.delete(info.symbol.split(".")[1]);
      } else {
        continue;
      }
    }

    this.memoryPath = tempGroup;

    return true;
  }

  /**
     * Denly Memory 触发器（监听器）
     * 用于对数据进行持久化和更新监听
     */
  public listener(options: listenerOption) {
    setInterval(() => {
      this.persistenceAll(options.http);
    }, options.interval);
  }

  public loader() {
    const path = this.memoryPath;
    for (const file of Deno.readDirSync(path)) {
      if (!file.isFile) continue;

      const fileSec = file.name.split(".");

      const filename = fileSec[0];
      const suffix = fileSec[1];

      if (suffix == "idx") continue;

      // Memory 数据读取（从持久化读取至内存）

      const decoder = new TextDecoder();

      const data = {
        dat: new Uint8Array(),
        idx: {
          expire: 0,
          checker: "",
          symbol: "",
        },
      };

      // 读取 Memory 数据及其索引信息
      data.dat = Deno.readFileSync(path + filename + ".dat");
      data.idx = JSON.parse(
        decoder.decode(Deno.readFileSync(path + filename + ".idx")),
      );

      // 过期数据则不读取
      if (data.idx.expire <= new Date().getTime() && data.idx.expire != 0) {
        continue;
      }

      // MD5 Checker 错误
      if (data.idx.checker != createHash("md5").update(data.dat).toString()) {
        continue;
      }

      const symbol = data.idx.symbol.split(".");

      this.group(symbol[0]);
      this.set(symbol[1], data.dat, data.idx.expire);

      Deno.removeSync(path + filename + ".dat");
      Deno.removeSync(path + filename + ".idx");
    }
    this.persistenceAll();
  }

  /**
     * 将目前已存在的数据全部持久化
     * PS: 拒绝持久化的数据会被过滤
     */
  public persistenceAll(http?: DenlyHttp) {
    const memorys = this.memorys;

    if (http?.debug) {
      EConsole.debug("{ Memory } 全局持久化处理中...");
    }

    for (const [name, group] of memorys.entries()) {
      if (group.status == 2) continue; // status 为 2 则不进行持久化

      // 遍历群组中的每一条数据
      for (const [symbol, memory] of group.memorys) {
        // 持久化是否支持
        if (!memory.persistence || !memory.persistence.usable) continue;

        const hash = createHash("md5");
        hash.update(this.thisGroup.toString() + "@" + symbol);

        const filename = "M@0" + hash.toString();
        const info = {
          expire: memory.expire || 0,
          checker: createHash("md5").update(memory.value).toString(),
          symbol: name + "." + symbol,
        };

        // 写入持久化
        try {
          Deno.writeFileSync(this.memoryPath + filename + ".dat", memory.value);
          Deno.writeTextFileSync(
            this.memoryPath + filename + ".idx",
            JSON.stringify(info),
          );
        } catch {
          EConsole.error(`[${name + "." + symbol}] 持久化保存失败...`);
          break;
        }

        let pers = this.memorys.get(name)?.memorys.get(symbol)?.persistence;

        if (pers) {
          pers.path = this.memoryPath + filename;
          pers.time = new Date().getTime();
          pers.usable = true;
        } else {
          pers = {
            path: "unknown",
            time: new Date().getTime(),
            usable: false,
          };
        }

        const group = this.memorys.get(name);
        if (group) {
          const mem = group.memorys.get(symbol);
          if (mem) {
            if (mem?.persistence) mem.persistence = pers;
            group.memorys.set(symbol, mem);
            this.memorys.set(name, group);
          }
        }
      }
    }
  }
}

export const Memory = new EMemory();
