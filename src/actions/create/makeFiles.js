// import makepack from "./files/makepack.js";
import packageJson from "./files/package-json.js";
import gitignore from "./files/gitignore.js";
import serve from "./files/serve.js";
import tsconfig from "./files/tsconfig.js";
import projectJs from "./files/project-js.js";
import projectJsx from "./files/project-jsx.js";
import projectTs from "./files/project-ts.js";
import projectTsx from "./files/project-tsx.js";

import inquirer from 'inquirer'
import fs from "fs-extra"
import path from "path"
import readmeMd from "./files/readme.md.js";

export default async (args) => {
   const files = [
      packageJson(args),
      gitignore(args),
      serve(args),
      readmeMd(args)
   ];

   switch (args.template) {
      case "typescript":
         files.push(projectTs(args))
         break
      case "react with typescript":
         files.push(projectTsx(args))
         break;
      case "javascript":
         files.push(projectJs(args))
         break
      case "react with javascript":
         files.push(projectJsx(args))
         break;
   }

   // push ts config
   if (args.template.includes("typescript")) {
      files.push(tsconfig(args))
   }

   for (let file of files) {
      // check if the file exists
      if (fs.existsSync(path.join(args.cwd, file.filename))) {
         const { overwrite } = await inquirer.prompt([
            {
               type: "confirm",
               name: 'overwrite',
               message: `The file ${file.filename} already exists, do you want to overwrite it?`,
               default: true
            }
         ])
         if (!overwrite) {
            continue
         } else {
            fs.removeSync(path.join(args.cwd, file.filename))
         }
      }

      fs.writeFileSync(path.join(args.cwd, file.filename), file.content)
   }
}
