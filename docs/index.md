## Denly web development framework

### Functions

- Route System
- Args & Form Data
- Response Method ( Redirect, Abort, Json )
- Memory System ( memory cache )
- Session & Cookie Manager ( realized in memory system )
- Event Manager ( trigger and timer )
- Hot-Loading ( automatic restart after editing the file )

### Some Examples

Here are some examples.

#### Simple Server

```typescript
import { Denly } from "https://deno.land/x/denly@V0.25/mod.ts";

let app = new Denly({ hostname: "127.0.0.1", port: 808 });

app.route.get("/", () => {
  return "Hello Denly!";
});

app.run();
```

#### Route Manager

```typescript
let router = app.route;

// Basic router register:
router.rule("/", () => {
  return "index page";
});

// dynamic path register:
router.rule("/:letter", (name: string) => {
  return `Hello ${name}!`;
});

// regex sign register:
router.regex("number", /^[0-9]*$/g); // use for dynamic path register.

// fallback register:
router.fallback(404, () => {
  return {
    header: new Headers(),
    body: "<h1>404 Not Found</h1>",
  };
});
```

#### Args & Form Data

```typescript
let req = app.request;

router.get("/", () => {
  return "Hello " + req.args("name") + "!";
});
// 127.0.0.1:808?name=Sam - Hello Sam!

router.post("/info", () => {
  return "Form Data: " + req.form("data");
});
// Use post to request '/info'
```

#### Hot-loading

```shell
deno run --allow-run https://deno.land/x/denly@V0.25/debug.ts ./mod.ts
```

> PS: you need open debug option in the './mod.ts' file.

#### Memory System

```typescript
import { Memory } from "https://deno.land/x/denly@V0.25/mod.ts";

Memory.set("foo", "bar"); // the data will save in the memory.

console.log(Memory.get("foo")); // from memory to get the data.

Memory.delete("foo"); // delete this data.

Memory.persistenceAll(); // save all data to the file. (autoexec)

Memory.clean(); // clean all data (include file data)

Memory.group("Session", false); // change group (second parameter can close file-cahce)
```

#### Custom Status

There are two ways to achieve status code customization:

```typescript
// just change the status code
router.rule("/", () => {
    app.response.status = 400;
    return "400 Error";
});

// abort will trigger custom fallback
router.rule("/",() => {
   return app.response.abort(404); 
});
```

#### Error Fallback 

You can send different error status codes and customize how you handle them.

```typescript
// create 404 fallback
app.route.fallback(404, (code: number) => {
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

#### Denly Cli

```shell
deno install https://deno.land/x/denly@V0.25/cli.ts -A -n denly
```

### Maintainers

- Originator: mrxiaozhuox \<mrxzx@qq.com\>
