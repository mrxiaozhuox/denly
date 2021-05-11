import { Watcher } from "./mod.ts";

let target: string = "";

if (Deno.args.length > 0) {
    target = Deno.args[0];
}

while (true) {
    let p = Deno.run({
        cmd: ['Deno', 'run', '-A', target,'-CHILD'],
        stderr: 'inherit',
        stdout: 'inherit'
    });

    await p.status();
}