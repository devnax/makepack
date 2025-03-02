
export default async (info) => {
   let dependencies = {}
   let devDependencies = {
      "makepack": "latest",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "express": "latest"
   }

   if (info.template.includes("typescript")) {
      devDependencies["typescript"] = "^4.4.2"
      devDependencies["@types/react"] = "^19.0.2"
      devDependencies["@types/react-dom"] = "^19.0.2"
      devDependencies["@types/express"] = "latest"
   }

   let main = info.sourceEntry.split('.')
   main.pop()

   const json = {
      name: info.projectDirName,
      version: "1.0.0",
      main: `./index.js`,
      module: `./esm/index.js`,
      types: `./types/index.d.ts`,
      description: "",
      keywords: [],
      exports: {
         ".": {
            "types": `./types/index.d.ts`,
            "import": `./esm/index.js`,
            "require": `./index.js`
         },
         "./*": {
            "import": `./esm/*.js`,
            "require": `./*.js`
         }
      },
      scripts: {
         "start": "makepack serve",
         "build": "makepack build",
         "pub": "makepack build -p"
      },
      dependencies,
      devDependencies
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}