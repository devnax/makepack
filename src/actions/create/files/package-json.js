
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
      module: `./index.js`,
      types: `./types/index.d.ts`,
      description: "",
      keywords: [],
      "exports": {
         ".": {
            "types": "./types/index.d.ts",
            "require": "./cjs/index.js",
            "import": "./index.js",
         },
         "./types/*": "./types/*.d.ts",
         "./cjs/*": "./cjs/*.js",
         "./*": {
            "import": "./*.js",
            "require": "./cjs/*.js"
         }
      },
      scripts: {
         "start": "makepack start",
         "build": "makepack build",
         "build:publish": "makepack publish"
      },
      dependencies,
      devDependencies
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}