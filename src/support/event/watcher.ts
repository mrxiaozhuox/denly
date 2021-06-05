import { _dirname, Denly, EConsole } from "../../mod.ts";

type callback = (status: string) => any;

/**
 * Watcher [obj]
 * Debug File Watcher
 */
export class Watcher {
    /**
       * Watcher.info [var]
       * watcher config information
       */
    public static info: {
        path: string;
        suffix: Array<string>;
    } = { path: _dirname + "/", suffix: ["ts"] };

    /**
       * Watcher.app
       * the denly application object
       */
    public static app: Denly;

    /**
       * Watcher.callback [var:func]
       * watcher triggered callback
       */
    private static callback: callback = (status: string) => {
        Watcher.defaultCallback(status);
    };

    /**
       * Watcher.lastReload [var]
       * the timestamp for the last reload
       */
    private static lastReload: number = new Date().getTime();

    /**
       * Watcher.defaultCallback [func]
       * default Controller
       */
    public static defaultCallback(status: string) {
        if (this.app.deop.options?.debug) {
            if (Deno.args.length > 0 && Deno.args[0] == "-HOTLOADING") {
                EConsole.debug("The file has changed, server has been restarted!");
                Deno.exit(0);
            }
        }
    }

    /**
       * Watcher.bind [func]
       * bind a new callback to watcher
       */
    public static bind(callback: callback) {
        Watcher.callback = callback;
    }

    /**
       * Watcher.listen [func]
       * start to listen the file modify
       */
    public static async listen() {
        const watcher = Deno.watchFs(Watcher.info.path, { recursive: true });
        for await (const event of watcher) {
            if (new Date().getTime() > Watcher.lastReload + 1000) {
                Watcher.lastReload = new Date().getTime();
                Watcher.callback(event.kind);
            }
        }
    }
}
