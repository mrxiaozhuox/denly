/**
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @description Denly Web Development Framework
 * @link https://denly.mrxzx.info/
 */

import { Denly } from "./src/mod.ts";

const app = new Denly({
    hostname: "127.0.0.1",
    port: 808,
    options: {
        debug: true,
    },
});


app.route.get("/", () => {
    return "Hello Denly!";
});

// Start the Denly HTTP Service
app.run();