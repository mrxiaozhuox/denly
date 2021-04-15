import { Denly } from "./system/core/denly.ts";

import { Router, Response, Cookie } from "./system/dev.ts";


let app = new Denly({
    hostname: "0.0.0.0",
    port: 808,
    options: {
        debug: true
    }
});

app.run();