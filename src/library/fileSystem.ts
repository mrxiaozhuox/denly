/**
 * Function: dirExist
 * determine whether the directory exists
 */
export function dirExist(path: string) {
    try {
        Deno.readDirSync(path);
    } catch (error) {
        return false;
    }

    return true;
}

/**
 * Function: dirCheck
 * if directory not found, then create a new 
 */
export function dirCheck(path: string) {
    if (!dirExist(path)) {
        try {
            Deno.mkdirSync(path, { recursive: true })
        } catch (errror) { return false; }
    }

    return true;
}

/**
 * Function: dirExist
 * determine whether the file exists
 */
export function fileExist(path: string) {
    try {
        Deno.readFileSync(path);
    } catch (error) {
        return false;
    }
    return true;
}