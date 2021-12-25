/**
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @description Denly Web Development Framework
 * @link https://denly.mrxzx.info/
 */

import { Denly, Memory, _tempdir, Cookie, Session } from "./src/mod.ts";


const app = new Denly({
    hostname: "127.0.0.1",
    port: 8848,
    options: {
        debug: true,
    },
});

// init the session setting
Session.init(Cookie.get("DENLSID"));

app.route.get("/", () => {
    return "Hello GET: " + Cookie.get("DENLSID");
});

app.route.post("/", () => {
    return "Hello POST";
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