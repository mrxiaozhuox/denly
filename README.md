# Denly Framework

## 快速运行

```typescript
import { Denly } from "https://gitee.com/mrxzx/Denly/raw/master/system/core/denly.ts";
import { Router } from 'https://gitee.com/mrxzx/Denly/raw/master/system/core/router.ts';

import { HttpError } from "https://gitee.com/mrxzx/Denly/raw/master/system/support/error.ts";

// // 服务器运行
let app: Denly = new Denly({
    hostname: "0.0.0.0",
    port: 808,
    options: {
        debug: true
    }
});

Router.rule("/", () => {
    return `<h1>Main Page</h1>`;
}, { type: "GET" });

app.run();
```

运行命令：```deno run --allow-net .\mod.ts```