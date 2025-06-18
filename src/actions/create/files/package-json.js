
export default async (info) => {
   let dependencies = {}
   let devDependencies = {
      "makepack": "latest",
      "express": "latest"
   }

   if (info.template.includes("react")) {
      devDependencies["react"] = "^19.0.0"
      devDependencies["react-dom"] = "^19.0.0"
   }

   if (info.template.includes("typescript")) {
      devDependencies["typescript"] = "^4.4.2"
      devDependencies["@types/react"] = "^19.0.2"
      devDependencies["@types/react-dom"] = "^19.0.2"
      devDependencies["@types/express"] = "latest"
   }

   const json = {
      name: info.pdir,
      version: "1.0.0",
      main: `./index.js`,
      module: `./index.mjs`,
      types: `./index.d.ts`,
      description: "",
      keywords: [],
      sideEffects: false,
      scripts: {
         "start": "makepack start",
         "build": "makepack build",
         "release": "makepack release"
      },
      "exports": {
         ".": {
            "import": "./index.mjs",
            "require": "./index.js",
            "types": "./index.d.ts"
         }
      },
      dependencies,
      devDependencies
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}