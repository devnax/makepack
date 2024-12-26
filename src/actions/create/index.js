import path from "path"
import fs from "fs-extra"
import { execSync, logLoader, __dirname } from "../../helpers.js"
import makeProjectInformation from "./makeProjectInformation.js"
import makeFiles from "./makeFiles.js"

const copyProjectFile = (name) => {
   try {
      const data = fs.readFileSync('./package.json', 'utf8');
      return JSON.parse(data);
   } catch (error) {
      console.error('Error reading package.json', error);
   }
}

const create = async () => {
   let projectInformation = await makeProjectInformation()
   let loader = logLoader("Creating project...")
   await makeFiles(projectInformation)
   loader.stop("")

   loader = logLoader("Installing dependencies...")
   execSync("npm install", {
      cwd: projectInformation.cwd,
   })

   loader.stop("Project setup complete!")

   console.log(`

  To start working with your project:
  1. Navigate to your project directory:
     cd ${projectInformation.dirname}
  
  2. Run the development server:
     makepack serve

  Enjoy your new project! 😊`);

}

export default create