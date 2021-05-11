// This is a test code for Denly Framework

import {
    Denly,
    Response
} from "./src/mod.ts";

let app = new Denly({
    hostname: "127.0.0.1",
    port: 808,
    options: {
        debug: true
    }
});


// app.route.get("/");
app.run();