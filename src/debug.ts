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

import { Watcher } from "./mod.ts";

let target: string = "";

if (Deno.args.length > 0) {
    target = Deno.args[0];
}

while (true) {
    let p = Deno.run({
        cmd: ['Deno', 'run', '-A', target, '-CHILD'],
        stderr: 'inherit',
        stdout: 'inherit'
    });

    await p.status();
}