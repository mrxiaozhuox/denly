/**
 * Denly Cli [support]
 * @author mrxiaozhuox<mrxzx@qq.com>
 * @abstract Denly project manager
 *
 *
 * Support Version: Denly V0.25
 * Update Date: 2021/05/27
 *
 */

import {
    rgb8,
} from "https://deno.land/std@0.97.0/fmt/colors.ts";

import { Memory } from "https://deno.land/x/denly@V0.25/library/memory.ts"

const helpMessage: string = `
🦕 ${rgb8("Denly Cli", 31)} 🦕

Website : https://denly.mrxzx.info/
Github  : https://github.com/mrxiaozhuox/Denly/
Author  : https://mrxzx.info/

USAGE:
    denly [OPTIONS] [SUBCOMMAND]

OPTIONS:
    -h Prints help information

SUBCOMMAND
    start           Start the Denly project.
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
        console.log(rgb8(`\nGetting the latest framework version!`, 42));
        const response = await fetch("https://api.github.com/repos/mrxiaozhuox/Denly/releases/latest");
        if (response.ok) {
            const data = await response.json();
            if ("name" in data) {

                Memory.set("lastVersion", data["name"], 60 * 60 * 24 * 7);
                Memory.persistenceAll();

                return data["name"];
            }
        }

        return "V0.25";
    } catch (_) {
        return "V0.25";
    }
}

/**
 * start the Denly server
 * @param hotloading 
 */
async function startServer(hotloading = false) {

    let normalCMD = [
        "deno",
        "run",
        "--allow-all",
        "--quiet",
        "--unstable",
        "https://deno.land/x/denon/denon.ts",
        "start",
    ];

    let HotloadingCMD = [
        "deno",
        "run",
        "--allow-all",
        "--quiet",
        "--unstable",
        "https://deno.land/x/denon/denon.ts",
        "debug",
    ];

    const cmd = hotloading ? HotloadingCMD : normalCMD;

    /** denon scripts not found */
    if (!fileExsit("./scripts.json")) {
        if (hotloading) {
            cmd[5] = `https://deno.land/x/denly@${await lastVersion()}/debug.ts`;
            cmd[6] = "./mod.ts";
            cmd.push("--debug");
        } else {
            cmd[5] = "./mod.ts";
            cmd.pop();
        }
    }

    const q = Deno.run({ cmd });
    await q.status();
}

async function initProject() {

    const name = prompt("project name (my-project):") || "my-project";

    if (dirExist("./" + name)) {
        console.log(rgb8(`Directory "./${name}" already exists!`, 1));
        Deno.exit(0);
    }

    let clone;
    try {
        clone = Deno.run({
            cmd: [
                "git",
                "clone",
                "https://github.com/DenlyJS/Denly-Template",
                name
            ],
        });

    } catch (error) {
        if (error.name == "NotFound") {
            console.log(rgb8(`\nYou need to install the "git" tool to do this!\n`, 3));
            console.log(rgb8(`Git: https://git-scm.com/ (version control system)\n`, 11));
            Deno.exit(0);
        }
    }
    if (!clone) return Deno.exit(0);

    const { success } = await clone.status();
    if (success && fileExsit("./" + name + "/scripts.json")) {
        console.log(rgb8(`\nProject initialzation successful!\n`, 2));
        console.log(rgb8(`cd ./${name}`, 11));
        console.log(rgb8(`denly debug\n`, 11));
        console.log(rgb8(`Try to exec command to start the server!`, 2))
        Deno.exit(0);
    } else {
        console.log(rgb8(`Project initialization failed!`, 35));
        Deno.exit(0);
    }
}

/**
 * Main Function
 */
async function main() {
    const args: string[] = Deno.args;

    if (args.length == 0) {
        console.log(helpMessage); Deno.exit(0);
    }

    if (args.length == 1 && (args[0] == "-h" || args[0] == "help")) {
        console.log(helpMessage); // help information
        Deno.exit(0);
    }

    if (args.length == 1) {
        if (args[0] == "start") {

            startServer(); // Normal Start Server

        } else if (args[0] == 'debug') {

            startServer(true); // Hot Loading Start Server

        } else if (args[0] == "init") {

            initProject(); // Init New Project

        } else if (args[0] == "lint") {

            await Deno.run({
                cmd: ["deno", "lint"]
            }).status();
            Deno.exit(0);
        }
    }
}


if (import.meta.main) {
    main(); // Main Function
}