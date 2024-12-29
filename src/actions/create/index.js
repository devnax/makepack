import { execSync, logLoader, logger } from "../../helpers.js"
import makeProjectInformation from "./makeProjectInformation.js"
import makeFiles from "./makeFiles.js"
import figlet from 'figlet'

const create = async () => {
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

   figlet("Make Pack CLI", function (err, data) {
      if (!err) {
         console.log(data);
      }
   });
}

export default create