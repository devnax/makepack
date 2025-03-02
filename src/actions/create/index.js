import { execSync, logger } from "../../helpers.js"
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
      cwd: path.join(cwd, cwdFolder),
      template: "typescript",
      sourceDir: "src",
      sourceEntry: "index.ts",
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
   information.cwd = path.join(cwd, information.projectDirName)
   let isCurrentDir = projectDirName !== cwdFolder

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
   const projectDir = path.join(cwd, information.projectDirName)

   if (information.projectDirName !== cwdFolder) {
      fs.removeSync(projectDir)
      fs.mkdirSync(projectDir)
   }

   if (!fs.existsSync(path.join(projectDir, information.sourceDir))) {
      fs.mkdirSync(path.join(projectDir, information.sourceDir))
   }

   switch (information.template) {
      case "react with typescript":
         information.sourceEntry = "index.tsx"
         break;
      case "react with javascript":
         information.sourceEntry = "index.jsx"
         break;
      case "javascript":
         information.sourceEntry = "index.js"
         break;
   }

   await makeFiles(information)

   logger.info("", "Installing Dependencies", false)
   execSync("npm install", {
      cwd: information.cwd,
   })

   logger.info("Project setup complete!", "", false)
   if (isCurrentDir) {
      console.log(`Run the development server: \n${logger.info("", "npm start", false)}\nEnjoy your new project! 😊`);
   } else {
      console.log(`To start working with your project:\nNavigate to your project directory:\n${logger.info("", "cd " + information.projectDirName, false)} and Run the development server:\n${logger.info("", "npm start", false)}\nEnjoy your new project! 😊`);
   }

   figlet("Makepack CLI", function (err, data) {
      if (!err) {
         console.log(data);
      }
   });
}

export default create