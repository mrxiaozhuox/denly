/**
 * @author mrxiaozhuox<mrxzx@qq.com>
 * some useful constant!
 */

/**
 * const: _dirname
 * Get the root directory
 */
export const _dirname = (() => {
    // return (Deno.mainModule).substring(0, Deno.mainModule.lastIndexOf("/") + 1).substr(8);
    return Deno.cwd();
})();

/**
 * const: _version
 * Get Denly framework version
 */
export const _version = "V0.23";

/**
 * @description Get Platform Separator
 */
export const _separator: string = (() => {
    if (Deno.build.os == "windows") {
        return "\\";
    } else {
        return "/";
    }
})();

/**
 * @description Get Temp Directory Path
 */
export const _tempdir: string = (() => {
    try {
        let temp: string = Deno.makeTempDirSync();
        let index = temp.lastIndexOf(_separator);

        let folder: string = temp.substring(0, index);

        Deno.removeSync(temp, { recursive: true });

        return folder;
    } catch (error) {
        return _dirname + "/temp/";
    }

    return "";
})();
