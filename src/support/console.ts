export const colorTab = {
  Black: "\x1b[30m", // 黑
  Red: "\x1b[31m", // 红
  Green: "\x1b[32m", // 绿
  Yellow: "\x1b[33m", // 黄
  Blue: "\x1b[34m", // 蓝
  Purple: "\x1b[35m", // 紫
  White: "\x1b[37m", // 白
  Clean: "\x1b[0m", // 清空
};

export class EConsole {
  public static blank(): void {
    console.log("");
  }

  public static log(message: string): void {
    console.log(message);
  }

  public static info(message: string, source: string = "Denly"): void {
    let temp: string = `[INFO] @${source}:> ${message}`;
    console.log(temp);
  }

  public static warn(message: string, source: string = "Denly"): void {
    let temp: string = `[WARN] @${source}:> ${message}`;
    console.warn(colorTab.Yellow + temp + colorTab.Clean);
  }

  public static error(message: string, source: string = "Denly"): void {
    let temp: string = `[ERROR] @${source}:> ${message}`;
    console.error(colorTab.Red + temp + colorTab.Clean);
  }

  public static debug(message: string, source: string = "Denly"): void {
    let temp: string = `[DEBUG] @${source}:> ${message}`;
    console.error(colorTab.Green + temp + colorTab.Clean);
  }
}
