import { execSync, concolor, logger } from "../../helpers.js"
import makeFiles from "./makeFiles.js"
import path from 'path'
import inquirer from 'inquirer'
import fs from "fs-extra"
const cwd = process.cwd()
const cwdFolder = cwd.split(path.sep).pop()

const valiateProjectName = (name) => {
   if (!name) {
      console.error("Project name cannot be empty.");
      return false;
   }
   if (!/^[a-z0-9-]+$/.test(name)) {
      console.error("Project name can only contain lowercase letters, numbers, and hyphens.");
      return false;
   }
   if (name.length < 3) {
      console.error("Project name must be at least 3 characters long.");
      return false;
   }
   if (name.length > 50) {
      console.error("Project name must be less than 50 characters long.");
      return false;
   }
   return true;
}

const create = async () => {

   let info = await inquirer.prompt([
      {
         type: 'input',
         name: 'pdir',
         message: 'Enter the project name',
         default: cwdFolder
      },
      {
         type: 'list',
         name: 'template',
         message: 'Select a template',
         choices: ['typescript', 'javascript', 'react with typescript', 'react with javascript'],
         default: "typescript"
      }
   ])

   // check if the pdir is exists
   let pdir = info.pdir.trim().replace(/\s+/g, '-').toLowerCase();
   const isValidProjectName = valiateProjectName(pdir)
   if (!isValidProjectName) return

   if (pdir !== cwdFolder) {
      if (fs.existsSync(path.join(cwd, pdir))) {
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

   const rootdir = path.join(cwd, pdir)
   let isCurrentDir = pdir !== cwdFolder
   logger.info("", "Creating project...", false)

   if (!fs.existsSync(rootdir)) {
      fs.mkdirSync(rootdir)
   }

   if (!fs.existsSync(path.join(rootdir, 'src'))) {
      fs.mkdirSync(path.join(rootdir, 'src'))
   }

   await makeFiles(info)

   logger.info("", "Installing Dependencies", false)
   execSync("npm install", {
      cwd: rootdir,
   })

   logger.success("Project setup complete!", "")
   if (isCurrentDir) {
      logger.info(`Run the development server: ${concolor.yellow("npm start")}\nEnjoy your new project! 😊`);
   } else {
      logger.info(`Navigate to your project directory:\n${concolor.yellow("cd " + info.pdir, false)} and Run the development server: ${concolor.yellow("npm start")}\nEnjoy your new project! 😊`);
   }
}

export default create