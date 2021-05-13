import { Controller } from "../../src/library/controller.ts";

export class Main extends Controller {
    public index() {
        return "Hello " + this.request.args("name");
    }
}