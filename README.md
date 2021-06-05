<p align="center">
    <br />
    <img src="./docs/icon.svg">
    <h3 align="center">🦕 Denly Web Framework 🦕</h3>
    <p align="center">
        <a href="https://github.com/mrxiaozhuox/Denly/releases/latest/">
            <img alt="Release" src="https://img.shields.io/github/v/release/mrxiaozhuox/Denly" />
        </a>
    	<a href="https://github.com/mrxiaozhuox/Denly">
    		<img alt="Denly Stars" src="https://img.shields.io/github/stars/mrxiaozhuox/Denly" />
    	</a>
        <a href="https://github.com/mrxiaozhuox/Denly/blob/master/LICENSE">
        	<img alt="MIT License" src="https://img.shields.io/badge/license-MIT-green" />
        </a>
	</p>
	<p align="center"><a href="https://denly.mrxzx.info">Home</a> | <a href="#">Documentation</a></p>
</p>

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
import { Denly } from "https://deno.land/x/denly@V0.25/mod.ts";

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

### Hot-loading [_unstable_]

if you want the server automatic restart after the file edited, then you can use
**hot-loading**.

```shell
deno run --allow-run https://deno.land/x/denly@V0.25/debug.ts ./mod.ts
```

### URL parameters

You can define a URL parameter based on a regular expression.

```typescript
app.route.regex("letter", /^[a-zA-Z]+$/g);
app.route.get("/user/:letter", (name: string) => {
  return `Hello ${name}`;
});
```

The framework is equipped with the following regular expressions by default:

- letter [ a-z A-Z ]
- number [ 0-9 ]
- email [ valid email ]
- phone [ phone number (for Chinese) ]
- date [ valid date ]

### Custom status code

```typescript
app.response.status = 500;

// return json code
return app.response.json({
  "code": 500,
  "data": [],
  "message": "Server Error",
});
```

### Error fallback

You can send different error status codes and customize how you handle them.

```typescript
app.route.fallback(404, () => {
  return {
    header: new Headers(), // A headers object
    body: new TextEncoder().encode("<h1>404 Not Found</h1>"),
  };
});

// trigger it
app.route.get("/error/404", () => {
  return app.response.abort(404);
});
```

### Output file

You can simply return a file.

```typescript
app.route.get("/image", () => {
  // Auto-updates headers based on the suffix.
  return app.response.file("./background.jpg");
});
```

The file function have second parameter can set **Content-Type**.

### Static route

```typescript
app.route.resource("/static", "./public");
```

You can bind a static routes by passing the path to the local folder and the
public alias to the **resource** function.

### File upload

```typescript
const file = app.request.file("file");
Deno.writeFileSync(
  _tempdir + "/runtime/upload/" + file.name,
  new Uint8Array(await file.arrayBuffer()),
);
```

You can use **Request.file** to upload file.

## Template

We provide a template code for large projects!

[Denly-Template](https://github.com/DenlyJS/Denly-Template)

or you can use denly-cli to init it!

```shell
deno install https://deno.land/x/denly@V0.25/cli.ts -A -n denly
```

create a new project:

```shell
denly init
```

## Developer

Author: ZhuoEr Liu <mrxzx@qq.com>

I am a back-end engineer and have recently been learning how to use Deno.
