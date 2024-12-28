import { execSync, logLoader, __dirname } from "../../helpers.js"
import makeProjectInformation from "./makeProjectInformation.js"
import makeFiles from "./makeFiles.js"

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
   if (projectInformation.isCurrentDir) {
      console.log(`Run the development server: \nnpm start\nEnjoy your new project! 😊`);
   } else {
      console.log(`To start working with your project:\n1. Navigate to your project directory:\ncd ${projectInformation.dirname}\n2. Run the development server:\nnpm start\nEnjoy your new project! 😊`);
   }


}

export default create