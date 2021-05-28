/**
 * Denly Cli [support]
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @abstract Denly project manager
 *
 *
 * Support Version: Denly V0.24
 * Update Date: 2021/05/27
 *
 */

import {
    rgb8,
} from "https://deno.land/std@0.97.0/fmt/colors.ts";

import { Memory } from "https://deno.land/x/denly@V0.23/library/memory.ts"

const helpMessage: string = `
🦕 ${rgb8("Denly Cli", 31)} 🦕

Website : https://denly.mrxzx.info/
Github  : https://github.com/mrxiaozhuox/Denly/
Author  : https://blog.wwsg18.com/

USAGE:
    denly [OPTIONS] [SUBCOMMAND]

OPTIONS:
    -h Prints help information

SUBCOMMAND
    run             Start the Denly project.
    debug           Start the project with Hot-loading.
    init            Initialize a new Denly project.
    lint            Check project lint (Deno lint).
`;


/**
 * file exsit
 * @param path 
 * @returns {boolean}
 */
function fileExsit(path: string) {
    try {
        return Deno.statSync(path).isFile;
    } catch (_) {
        return false;
    }
}

/**
 * dir exist
 * @param path 
 * @returns {boolean}
 */
function dirExist(path: string) {
    try {
        return Deno.statSync(path).isDirectory;
    } catch (_) {
        return false;
    }
}

async function lastVersion() {

    // 初始化 Memory 系统
    Memory.group("DenlyCli");
    Memory.loader();

    if (Memory.get("lastVersion")) {
        return (new TextDecoder().decode(Memory.get('lastVersion')));
    }

    try {
        const response = await fetch("https://api.github.com/repos/mrxiaozhuox/Denly/releases/latest");
        if (response.ok) {
            const data = await response.json();
            if ("name" in data) {

                Memory.set("lastVersion", data["name"]);
                Memory.persistenceAll();

                return data["name"];
            }
        }

        return "V0.23";
    } catch (_) {
        return "V0.23";
    }
}

/**
 * load denly.json
 * @param item
 */
function loadConfig(item: string) {
    if (!fileExsit("./denly.json")) return null;

    const rawConfig = Deno.readTextFileSync("./denly.json");
    let config = [];

    try {
        config = JSON.parse(rawConfig);
    } catch (_) {
        return null;
    }

    const itemList = item.split(".");
    let section = config;
    for (let index = 0; index < itemList.length; index++) {
        if (itemList[index] in section) {
            section = section[itemList[index]];
        } else {
            section = null;
        }
    }

    return section;
}

/**
 * start the Denly server
 * @param hotloading 
 */
async function startServer(hotloading = false) {

    let normalCMD = [
        "deno",
        "run",
        '-A',
        '--unstable',
        loadConfig("scripts.entry") || "./mod.ts",
    ];

    let HotloadingCMD = [
        "deno",
        "run",
        "-A",
        "--unstable",
        "https://deno.land/x/denly@V0.23/debug.ts",
        loadConfig("scripts.entry") || "./mod.ts",
    ];

    if (loadConfig("scripts.entry") || "./mod.ts") {

        const q = Deno.run({ cmd: hotloading ? HotloadingCMD : normalCMD });

        await q.status();
    } else {
        console.log(rgb8(`The entry file does not exist: ${rgb8("\"./mod.ts\"", 3)}`, 1));
    }
}

async function initProject() {
    const name = prompt(`project name (my-project): `) || "my-project";

    const version = prompt(`version (1.0.0): `) || "1.0.0";

    const description = prompt(`description: `) || "Hello Denly!";

    const author = prompt("author (denly):") || "denly";


    const root = "./" + name + "/";

    if (!dirExist(root)) {
        try {
            Deno.mkdirSync(root);
        } catch (_) {
            console.log(rgb8("Folder creation failed... ", 1))
            Deno.exit(0);
        }
    }

    try {
        Deno.writeTextFileSync(root + "denly.json", JSON.stringify({
            name: name,
            author: author,
            version: version,
            description: description,
            scripts: {
                entry: "./mod.ts",

            }
        }, null, 4));

        Deno.writeTextFileSync(root + "mod.ts", "");


        console.log(`${rgb8("\nProject initialized successfully.\n", 2)}`);
        console.log(rgb8(`   cd ${rgb8("./" + name, 32)}\n`, 34));
        console.log(rgb8(`   denly hot\n`, 34));
        console.log(rgb8(`Exec the commands to run the test server!\n`, 42));
    } catch (error) {
        console.log(rgb8(`{./${name}} Project init failed... `, 1))
        Deno.exit(0);
    }
}

/**
 * Main Function
 */
async function main() {
    const args: string[] = Deno.args;

    if (args.length == 0) {
        console.log(helpMessage); return;
    }

    if (args.length == 1 && (args[0] == "-h" || args[0] == "help")) {
        console.log(helpMessage); // help information
        return;
    }

    if (args.length == 1) {
        if (args[0] == "run") {

            startServer(); // Normal Start Server

        } else if (args[0] == 'debug') {

            startServer(true); // Hot Loading Start Server

        } else if (args[0] == "init") {

            initProject(); // Init New Project

        }
    }

}

if (import.meta.main) {
    main(); // Main Function
}