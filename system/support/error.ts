import { Status, STATUS_TEXT } from "https://deno.land/std@0.92.0/http/http_status.ts";

/**
 * server.body
 * @author mrxiaozhuox <mrxzx@qq.com>
 */


export class HttpError extends Error {

    public code: number = 0;

    constructor(code: number) {
        super(STATUS_TEXT.get(code) || STATUS_TEXT.get(500));
        if (STATUS_TEXT.has(code)) {
            this.code = code;
        } else {
            this.code = 500;
        }
    }

    public _httperror: boolean = true;
}

// export class ClientError extends Error {

//     public code: number = 400;

//     constructor(code: number) {
//         super("ERROR_" + code.toString());

//         if (code <= 100) {
//             this.code += code;
//         } else {
//             this.code = code;
//         }
//     }

//     public _httperror: boolean = true;
// }

// export class ServerError extends Error {

//     public code: number = 500;

//     constructor(code: number) {
//         super("ERROR_" + code.toString());

//         if (code <= 100) {
//             this.code += code;
//         } else {
//             this.code = code;
//         }
//     }

//     public _httperror: boolean = true;
// }