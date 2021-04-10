import { Denly } from "./system/core/denly.ts";
import { Router } from './system/core/router.ts';

import { DCons } from "./system/tools.ts";

// 服务器运行
let app: Denly = new Denly({
    hostname: "0.0.0.0",
    port: 808,
    options: {
        debug: true
    }
});

Router.rule("/", () => {
    return `<h1>Main Page</h1>`;
}, { method: "GET" });

app.run();