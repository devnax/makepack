import path from "path"
import fs from "fs-extra"
import inquirer from "inquirer"
const cwd = process.cwd()
const cwdFolder = cwd.split(path.sep).pop()

export default async () => {
   const { projectDirName } = await inquirer.prompt([
      {
         type: 'input',
         name: 'projectDirName',
         message: 'Enter the project name',
         default: cwdFolder
      }
   ])

   let projectDir = cwd

   if (projectDirName !== cwdFolder) {
      projectDir = path.join(cwd, projectDirName);
      if (fs.existsSync(projectDir)) {
         const { proceed } = await inquirer.prompt([
            {
               type: "confirm",
               name: 'proceed',
               message: "The directory already exists, do you want to overwrite it?",
               default: cwdFolder
            }
         ])
         if (!proceed) {
            console.log('Project creation canceled.');
            return
         }
      }
   }

   return {
      cwd: projectDir,
      diraname: path.basename(projectDir)
   }
}