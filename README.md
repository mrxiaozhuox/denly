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

### Hot-loading [*unstable*]

if you want the server automatic restart after the file edited, then you can use
**hot-loading**.

```shell
deno run --allow-run https://deno.land/x/denly@V0.23/debug.ts ./mod.ts
```



### URL parameters

You can define a URL parameter based on a regular expression.

```typescript
app.route.regex("letter", /^[a-zA-Z]+$/g);
app.route.get("/user/:letter",(name: string) => {
    return `Hello ${name}`;
});
```

The framework is equipped with the following regular expressions by default:

* letter [ a-z A-Z ]
* number [ 0-9 ]
* email [ valid email ]
* phone [ phone number (for Chinese) ]
* date [ valid date ]

### Error fallback

You can send different error status codes and customize how you handle them.

```typescript
app.route.fallback(404, () => {
    return {
        header: new Headers(), // A headers object
        body: new TextEncoder().encode("<h1>404 Not Found</h1>"), // Uint8Array or string
    };
});

// trigger it
app.route.get("/error/404",() => {
    return app.response.abort(404);
});
```

### Output file

You can simply return a file.

```typescript
app.route.get("/image",() => {
    // Auto-updates headers based on the suffix.
    return app.response.file("./background.jpg"); 
});
```

The file function have second parameter can set **Content-Type**.

## Developer

Author: ZhuoEr Liu <mrxzx@qq.com>

I am a back-end engineer and have recently been learning how to use Deno.

