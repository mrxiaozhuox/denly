import { Denly } from "./system/core/denly.ts";
import { Router } from './system/core/router.ts';

import { DCons } from "./system/tools.ts";

import { Memory } from "./system/library/memory.ts";

// 服务器运行
let app: Denly = new Denly({
    hostname: "0.0.0.0",
    port: 808,
    options: {
        debug: true
    }
});

app.config.memory.interval = 3000;

Router.rule("/", () => {
    return `<h1>Main Page</h1>`;
}, { method: "GET" });

Memory.set("testFile", Deno.readFileSync("C:\\Users\\mrxiaozhuox\\Pictures\\Backgrounds\\hello.jpg"));

app.run();