import { execSync, logLoader, __dirname } from "../../helpers.js"
import makeProjectInformation from "./makeProjectInformation.js"
import makeFiles from "./makeFiles.js"
import figlet from 'figlet'

const create = async () => {
   let info = await makeProjectInformation()
   let loader = logLoader("Creating project...")
   await makeFiles(info)
   loader.stop("")

   loader = logLoader("Installing dependencies...")
   execSync("npm install", {
      cwd: info.cwd,
   })

   loader.stop("Project setup complete!")
   if (info.isCurrentDir) {
      console.log(`Run the development server: \nnpm start\nEnjoy your new project! 😊`);
   } else {
      console.log(`To start working with your project:\n1. Navigate to your project directory:\ncd ${info.dirname}\n2. Run the development server:\nnpm start\nEnjoy your new project! 😊`);
   }

   figlet("Make Pack CLI", function (err, data) {
      if (!err) {
         console.log(data);
      }
   });
}

export default create