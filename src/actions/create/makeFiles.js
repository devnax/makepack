// import makepack from "./files/makepack.js";
import packageJson from "./files/package-json.js";
import gitignore from "./files/gitignore.js";
import serve from "./files/serve.js";
import tsconfig from "./files/tsconfig.js";
import projectJs from "./files/project-js.js";
import projectTs from "./files/project-ts.js";

import fs from "fs-extra"
import path from "path"

export default async (args) => {
   const files = [
      packageJson(args),
      gitignore(args),
      serve(args),
   ];

   switch (args.template) {
      case "typescript":
      case "react with typescript":
         files.push(projectTs(args))
         break;
      case "javascript":
      case "react with javascript":
         files.push(projectJs(args))
         break;
   }

   // push ts config
   if (args.template.includes("typescript")) {
      files.push(tsconfig(args))
   }

   for (let file of files) {
      fs.writeFileSync(path.join(args.cwd, file.filename), file.content)
   }
}
