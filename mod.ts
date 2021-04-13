import { Denly } from "./system/core/denly.ts";
import { Router } from './system/core/router.ts';

import { DCons, Memory, Request, Session } from "./system/tools.ts";

// 服务器运行
let app: Denly = new Denly({
    hostname: "0.0.0.0",
    port: 808,
    options: {
        debug: true
    }
});

app.config.memory.interval = 120 * 1000;

Router.rule("/", () => {
    return "Hello World";
}, { method: "GET" });

app.run();