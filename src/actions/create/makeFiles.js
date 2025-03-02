// import makepack from "./files/makepack.js";
import packageJson from "./files/package-json.js";
import gitignore from "./files/gitignore.js";
import App from "./files/App.js";
import tsconfig from "./files/tsconfig.js";
import projectJs from "./files/project-js.js";
import projectJsx from "./files/project-jsx.js";
import projectTs from "./files/project-ts.js";
import projectTsx from "./files/project-tsx.js";

import inquirer from 'inquirer'
import fs from "fs-extra"
import path from "path"
import readmeMd from "./files/readme.md.js";

export default async (info) => {
   const files = [
      await packageJson(info),
      await gitignore(info),
      await App(info),
      await readmeMd(info)
   ];

   switch (info.template) {
      case "typescript":
         files.push(await projectTs(info))
         break
      case "react with typescript":
         files.push(await projectTsx(info))
         break;
      case "javascript":
         files.push(await projectJs(info))
         break
      case "react with javascript":
         files.push(await projectJsx(info))
         break;
   }

   // push ts config
   if (info.template.includes("typescript")) {
      files.push(await tsconfig(info))
   }

   for (let file of files) {
      // check if the file exists
      if (fs.existsSync(path.join(info.cwd, file.filename))) {
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
            fs.removeSync(path.join(info.cwd, file.filename))
         }
      }

      fs.writeFileSync(path.join(info.cwd, file.filename), file.content)
   }
}
