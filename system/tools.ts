let path = (import.meta.url).split("/");
{ path.pop(); path.pop(); } // 删除后两段，获取主程序

export const ROOT_PATH = path.join("/");