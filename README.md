# Denly Framework

> A study & practice project for Deno...

## Functions

- Router System
- Get Args & Form Data
- Response System (redirect,abort)
- Memory System (useful cache)
- Session (realized in memory sys)
- Event (trigger and timer)
- Hot-Loading (automatic restart after editing the file)

## Try it

You just need import the file from github (or gitee)

```typescript
import { Denly } from "https://deno.land/x/denly@V0.23/mod.ts";

let app = new Denly({
  hostname: "127.0.0.1",
  port: 808,
  options: {
    debug: true,
  },
});

app.route.get("/", () => {
  return "Hello Denly!";
});

app.run();
```

It's easy to use, you don't need to download other file, just import the package
from online.

### Hot-loading []

if you want the server automatic restart after the file edited, then you can use
**hot-loading**.

```shell
deno run --allow-run https://deno.land/x/denly@V0.23/debug.ts ./mod.ts
```

## Developer

Author: ZhuoEr Liu <mrxzx@qq.com>

I am a back-end engineer and have recently been learning how to use Deno.
