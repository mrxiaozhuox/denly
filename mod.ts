import { Denly } from "./system/core/denly.ts";
import { Router } from './system/core/router.ts';

import { ROOT_PATH } from "./system/tools.ts";

console.log(ROOT_PATH);

// // 服务器运行
let app: Denly = new Denly({
    hostname: "0.0.0.0",
    port: 808,
    options: {
        debug: true
    }
});

app.config.storage = {
    temp: "/"
}

Router.rule("/", () => {
    return `<h1>Main Page</h1>`;
}, { method: "GET" });

app.run();