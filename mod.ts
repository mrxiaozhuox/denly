/**
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @description Denly Web Development Framework
 * @link https://denly.mrxzx.info/
 */

import { Denly, Memory } from "./src/mod.ts";


const app = new Denly({
    hostname: "127.0.0.1",
    port: 808,
    options: {
        debug: true,
    },
});


app.route.get("/", async () => {
    return "Hello World";
});


/**
 * Have a good habit.
 * Save Memory until the program ends.
 */
window.onunload = function () {
    Memory.persistenceAll();
}

// Start the Denly HTTP service
app.run();