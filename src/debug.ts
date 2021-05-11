/**
 * Denly Watcher [support]
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @abstract Denly hot-loading system
 * 
 * if the server use debug method and you need hot-loading, then you can use this file.
 * when any file was modify, the server will be auto-restart.
 * 
 * Example:
 * deno run --allow-run https://deno.land/x/denly/debug.ts ./mod.ts
 * 
 * Support Version: Denly V0.21
 * Update Date: 2021/05/11
 * 
 */

import { Watcher, EConsole } from "./mod.ts";
import { fileExist } from "./library/fileSystem.ts"

if (import.meta.main) {
    let target: string = "";

    if (Deno.args.length > 0) {
        target = Deno.args[0];
    }

    while (true) {

        if (!fileExist(target)) {
            EConsole.error(`File: '${target}' is not found.`); break;
        }

        let p = Deno.run({
            cmd: ['Deno', 'run', '-A', target, '-CHILD'],
            stderr: 'inherit',
            stdout: 'inherit'
        });

        await p.status();
    }
} else {
    EConsole.warn("Please use 'debug.ts' as the main program.");
}