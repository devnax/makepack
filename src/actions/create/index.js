import { execSync, logger } from "../../helpers.js"
import makeProjectInformation from "./makeProjectInformation.js"
import makeFiles from "./makeFiles.js"
import path from 'path'
import inquirer from 'inquirer'
import figlet from 'figlet'
import fs from "fs-extra"
const cwd = process.cwd()
const cwdFolder = cwd.split(path.sep).pop()

const create = async () => {
   const information = {
      projectDirName: cwdFolder,
      template: "typescript",
      sourceDir: "src",
      sourceEntry: "index.ts",
      serverEntry: "serve.ts"
   }

   let { projectDirName } = await inquirer.prompt([
      {
         type: 'input',
         name: 'projectDirName',
         message: 'Enter the project name',
         default: information.projectDir
      }
   ])

   if (projectDirName !== cwdFolder) {
      if (fs.existsSync(path.join(cwd, projectDirName))) {
         const { proceed } = await inquirer.prompt([
            {
               type: "confirm",
               name: 'proceed',
               message: "The directory already exists, do you want to overwrite it?",
               default: "No"
            }
         ])
         if (!proceed) {
            console.log('Project creation canceled.');
            return
         }
      }
   }

   information.projectDirName = projectDirName

   // template
   const { template } = await inquirer.prompt([
      {
         type: 'list',
         name: 'template',
         message: 'Select a template',
         choices: ['typescript', 'javascript', 'react with typescript', 'react with javascript'],
         default: information.template
      }
   ])

   information.template = template

   logger.info("", "Creating project...", false)

   if (information.projectDirName !== cwdFolder) {
      fs.removeSync(path.join(cwd, information.projectDirName))
      fs.mkdirSync(path.join(cwd, information.projectDirName))
   }

   if (!fs.existsSync(path.join(cwd, information.sourceDir))) {
      fs.mkdirSync(path.join(cwd, information.sourceDir))
   }

   switch (information.template) {
      case "react with typescript":
         information.sourceEntry = "index.tsx"
         break;
      case "react with javascript":
         information.sourceEntry = "index.jsx"
         information.serverEntry = "server.js"
         break;
      case "javascript":
         information.sourceEntry = "index.js"
         information.serverEntry = "server.js"
         break;
   }

   const projectDir = path.join(cwd, information.projectDirName)

   // creating makepack.js
   fs.writeFileSync(path.join(projectDir, "makepack.js"), `import { execSync, logger } from "makepack";\n\nconst makepack = async () => {\n   logger.info("Building project...", "", false)\n   execSync("npm run build")\n   logger.info("Project build complete!", "", false)\n}\n\nmakepack()`)

   // creating package.json
   fs.writeFileSync(path.join(projectDir, "package.json"), `{\n   "name": "${information.projectDir}",\n   "version": "1.0.0",\n   "main": "${information.serverEntry}",\n   "scripts": {\n      "start": "node ${information.serverEntry}"\n   }\n}`)

   // creating server entry
   fs.writeFileSync(path.join(projectDir, information.serverEntry), `import express from 'express';\nconst app = express();\n\napp.get('/', (req, res) => {\n   res.send('Hello World!')\n})\n\napp.listen(3000, () => {\n   console.log('Server is running on http://localhost:3000')\n})`)

   return

   let info = await makeProjectInformation()
   logger.info("", "Creating project...", false)
   await makeFiles(info)

   logger.info("", "Installing Dependencies", false)
   execSync("npm install", {
      cwd: info.cwd,
   })

   logger.info("Project setup complete!", "", false)
   if (info.isCurrentDir) {
      console.log(`Run the development server: \n${logger.info("", "npm start", false)}\nEnjoy your new project! 😊`);
   } else {
      console.log(`To start working with your project:\nNavigate to your project directory:\n${logger.info("", "cd " + info.dirname, false)} and Run the development server:\n${logger.info("", "npm start", false)}\nEnjoy your new project! 😊`);
   }

   figlet("Make build CLI", function (err, data) {
      if (!err) {
         console.log(data);
      }
   });
}

export default create