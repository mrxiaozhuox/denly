// This is a test code for Denly Framework

import { Denly } from "./src/mod.ts";

let app = new Denly({
    hostname: "127.0.0.1",
    port: 808,
    options: {
        debug: true
    }
});

app.route.get("/",() => { return "<h1>Hello Denly</h1>"; });

app.run();