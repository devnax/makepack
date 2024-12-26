import path from "path"
import fs from "fs-extra"
import inquirer from "inquirer"
import { execSync, logLoader } from "../helpers.js"
const cwd = process.cwd()
const cwdFolder = cwd.split(path.sep).pop()

const create = async (args) => {
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

   let { template } = await inquirer.prompt([
      {
         type: 'list',
         name: 'template',
         message: 'Select a template',
         choices: ['typescript', 'javascript', 'react with typescript', 'react with javascript'],
         default: 'typeScript'
      }
   ])

   if (projectDirName !== cwdFolder) {
      fs.removeSync(projectDir)
      fs.mkdirSync(projectDir)
   }
   let dependencies = {}
   let devDependencies = {
      // "make-pack": "@latest"
   }

   if (template.includes("react")) {
      dependencies = {
         "react": "^17.0.2",
         "react-dom": "^17.0.2"
      }
   }

   if (template.includes("typescript")) {
      devDependencies["typescript"] = "^4.4.2"
      devDependencies["@types/react"] = "^18.3.12"
      devDependencies["@types/react-dom"] = "^18.3.1"
   }

   let loader = logLoader("Creating project...")
   fs.mkdirSync(path.join(projectDir, "src"))
   fs.writeFileSync(path.join(projectDir, "package.json"), JSON.stringify({
      name: projectDirName,
      version: "1.0.0",
      description: "",
      main: "index.js",
      scripts: {
         "start": "makepack serve",
         "build": "makepack build",
      },
      dependencies,
      devDependencies,
      keywords: [],
   }, null, 2), "utf-8")

   switch (template) {
      case "typescript":
         fs.writeFileSync(path.join(projectDir, "src/index.ts"), `console.log("Hello, World!")`, "utf-8")
         break;
      case "react with typescript":
         fs.writeFileSync(path.join(projectDir, "src/index.tsx"), `import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to React Typescript with make-pack CLI!</h1>
      <p>Edit <code>index.tsx</code> and save to reload.</p>
      <a
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#61dafb', textDecoration: 'none' }}
      >
        Learn React
      </a>
    </div>
  );
};

export default App;
         `)

         break;
      case "javascript":
         fs.writeFileSync(path.join(projectDir, "src/index.js"), `console.log("Hello, World!")`, "utf-8")
         break;
      case "react with javascript":
         fs.writeFileSync(path.join(projectDir, "src/index.jsx"), `import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to React JS with make-pack CLI!</h1>
      <p>Edit <code>index.jsx</code> and save to reload.</p>
      <a
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#61dafb', textDecoration: 'none' }}
      >
        Learn React
      </a>
    </div>
  );
};
export default App;
         `)
         break;
   }

   // generate tsconfig.json
   if (template.includes("typescript")) {
      let config = {
         "compilerOptions": {
            "target": "es5",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": true,
            "skipLibCheck": true,
            "esModuleInterop": true,
            "allowSyntheticDefaultImports": true,
            "strict": true,
            "forceConsistentCasingInFileNames": true,
            "module": "esnext",
            "moduleResolution": "node",
            "resolveJsonModule": true,
            "isolatedModules": true,
            "noEmit": true,
         },
         "include": ["src"]
      }
      // config for react 
      if (template.includes("react")) {
         config.compilerOptions["jsx"] = "react-jsx"
         config.compilerOptions["jsxImportSource"] = "react"
      }
      fs.writeFileSync(path.join(projectDir, "tsconfig.json"), JSON.stringify(config, null, 2), "utf-8")
   }

   // generate .gitignore
   fs.writeFileSync(path.join(projectDir, ".gitignore"), "node_modules\n", "utf-8")

   loader.stop("")

   loader = logLoader("Installing dependencies...")
   execSync("npm install", {
      cwd: projectDir,
   })

   loader.stop("Project setup complete!")

   console.log(`

  To start working with your project:
  1. Navigate to your project directory:
     cd ${projectDirName}
  
  2. Run the development server:
     makepack serve

  Enjoy your new project! 😊`);

}

export default create