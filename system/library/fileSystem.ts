/**
 * 检测一个目录是否存在
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
 * 如果一个目录不存在，则自动创建
 */
export function dirCheck(path: string) {
    if (dirExist(path)) {
        try {
            Deno.mkdirSync(path, { recursive: true })
        } catch (errror) { return false; }
    }

    return true;
}