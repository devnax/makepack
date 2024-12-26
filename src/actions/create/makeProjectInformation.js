import inquirer from "inquirer"
import makeProjectDirectory from "./makeProjectDirectory.js"
import fs from "fs-extra"
import path from "path"
const cwd = process.cwd()
const cwdFolder = cwd.split(path.sep).pop()

const makeProjectInformation = async () => {
   const projectDir = await makeProjectDirectory()
   const information = await inquirer.prompt([
      {
         type: 'list',
         name: 'template',
         message: 'Select a template',
         choices: ['typescript', 'javascript', 'react with typescript', 'react with javascript'],
         default: 'typeScript'
      },
      {
         type: 'input',
         name: 'rootdir',
         message: 'Root directory of the project',
         default: "src"
      },
      {
         type: 'input',
         name: 'entry',
         message: 'Entry file of the project',
         default: "index"
      }
   ])

   if (projectDir.diraname !== cwdFolder) {
      fs.removeSync(projectDir.cwd)
      fs.mkdirSync(projectDir.cwd)
   }

   switch (information.template) {
      case "typescript":
         information.entry = information.entry + ".ts"
         break;
      case "javascript":
         information.entry = information.entry + ".js"
         break;
      case "react with typescript":
         information.entry = information.entry + ".tsx"
         break;
      case "react with javascript":
         information.entry = information.entry + ".jsx"
         break;
   }

   fs.mkdirSync(path.join(projectDir.cwd, information.rootdir))

   /* 
   {
     port: 3000,
     outdir: "build",
     cwd: 'C:\xampp\htdocs\makepack\asd',
     diraname: 'asd',
     template: 'typescript',
     rootdir: 'src',
     entry: 'index'
   }
   */

   return {
      port: 3000,
      outdir: "build",
      ...projectDir,
      ...information
   }
}

export default makeProjectInformation