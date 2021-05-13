import { DRequest, DResponse, Request, Response } from "../core/server/http.ts";
import { fileExist, dirExist } from "../library/fileSystem.ts";
import { _dirname } from "../mod.ts";

/**
 * @description Controller Function Struct
 */
type ctrl = (...parms: string[]) => any;

export class DCtrlManager {
    public workspace: string = _dirname + "/application/controller/";

    /**
     * load controller method
     * @param {string} controller
     * @returns {Function} Controller Function
     * 
     */
    public load(controller: string): ctrl {
        let res: ctrl = () => { Response.abort(404) };

        let path: string = this.workspace;

        let ctrls: string[] = controller.split(".");

        let pathEnd: number = -1;

        try {
            ctrls.forEach((value, index) => {
                value = value.toLowerCase();

                if (dirExist(path + "/" + value)) {
                    path = path + "/" + value;
                } else if (fileExist(path + "/" + value + ".ts")) {
                    path = path + "/" + value + ".ts";
                    throw new Error(index.toString());
                }
            });
        } catch (error) { pathEnd = parseInt(error.message) + 1; }

        console.log(path);
        if (path.substring(path.length - 3) == '.ts' && pathEnd != -1) {
            // file is found
            console.log("FOUND");
            for (let index = pathEnd; index < ctrls.length; index++) {
                const element = ctrls[index];
            }

            import("file://" + path).then((Demo) => {
                console.log(Demo);
            });
        }


        return res;
    }
}

export let CtrlManager: DCtrlManager = new DCtrlManager();

/**
 * @class Controller
 * @description Denly Controller
 */
export class Controller {

    /**
     * @description Request Object
     */
    public request: DRequest = Request;

    /**
     * @description Response Object
     */
    public response: DResponse = Response;
}