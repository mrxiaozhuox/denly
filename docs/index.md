## Denly web development framework

### Functions

* Route System
* Args & Form Data
* Response Method ( Redirect, Abort, Json )
* Memory System ( memory cache )
* Session & Cookie Manager ( realized in memory system )
* Hot-Loading ( automatic restart after editing the file )

### Some Examples

Here are some examples.

#### Simple Server

```typescript
import { Denly } from "https://deno.land/x/denly@V0.21/mod.ts";

let app = new Denly({ hostname: "127.0.0.1",port: 808 });

app.route.get("/", () => {
    return "Hello Denly!";
});

app.run();
```

#### Route Manager

```typescript
let router = app.route;

// Basic router register:
router.rule("/",() => { return "index page"; });

// dynamic path register:
router.rule("/:letter",(name: string) => {
    return `Hello ${name}!`;
});

// regex sign register:
router.regex("number", /^[0-9]*$/g); // use for dynamic path register.

// fallback register:
router.fallback(404,() => {
    return {
        header: new Headers(),
        body: "<h1>404 Not Found</h1>"
    };
});
```

#### Args & Form Data

```typescript
let req = app.request;

router.get("/",() => {
    return "Hello " + req.args("name") + "!";
});
// 127.0.0.1:808?name=Sam - Hello Sam!

router.post("/info",() => {
   return "Form Data: " + req.form("data"); 
});
// Use post to request '/info'
```

#### Hot-loading

```shell
deno run --allow-run https://deno.land/x/denly@V0.21/debug.ts ./mod.ts
```

> PS: you need open debug option in the './mod.ts' file.

#### Memory System

```typescript
import { Memory } from "https://deno.land/x/denly@V0.21/mod.ts";

Memory.set("foo","bar");  // the data will save in the memory.

console.log(Memory.get("foo")); // from memory to get the data.

Memory.delete("foo"); // delete this data.

Memory.persistenceAll(); // save all data to the file. (autoexec)

Memory.clean(); // clean all data (include file data)

Memory.group('session',false); // change group (second parameter can close file-cahce)
```



### Maintainers

* Originator: mrxiaozhuox \<mrxzx@qq.com\>