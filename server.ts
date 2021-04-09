import { Denly, Request } from "./system/core/denly.ts";
import { Router } from './system/core/router.ts';

import { } from "./system/core/server/http.ts";

// // 服务器运行
let app: Denly = new Denly({
    hostname: "0.0.0.0",
    port: 808,
    options: {
        debug: true
    }
});


Router.rule("/", () => {

    console.log(Request.args("hello"));

    return Request.args("hello");

    return `<h1>Main Page</h1>`;
}, { method: "GET" });

app.run();