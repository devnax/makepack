// import makepack from "./files/makepack.js";
import packageJson from "./files/package-json.js";
import gitignore from "./files/gitignore.js";
import tsconfig from "./files/tsconfig.js";
import projectJs from "./files/project-js.js";
import projectTs from "./files/project-ts.js";
import projectReactJs from "./files/project-react-js.js";
import projectReactTs from "./files/project-react-ts.js";

import fs from "fs-extra"
import path from "path"

export default async (args) => {
   const files = [
      packageJson(args),
      gitignore(args),
   ];

   switch (args.template) {
      case "typescript":
         files.push(projectTs(args))
         break;
      case "javascript":
         files.push(projectJs(args))
         break;
      case "react with typescript":
         files.push(projectReactTs(args))
         break;
      case "react with javascript":
         files.push(projectReactJs(args))
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
