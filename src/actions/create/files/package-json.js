
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
      main: `./cjs/index.js`,
      module: `./index.js`,
      types: `./index.d.ts`,
      description: "",
      keywords: [],
      sideEffects: false,
      scripts: {
         "start": "makepack start",
         "build": "makepack build",
         "release": "makepack release"
      },
      exports: {
         ".": {
            "require": {
               "types": "./index.d.ts",
               "default": "./cjs/index.js"
            },
            "import": {
               "types": "./index.d.ts",
               "default": "./index.js"
            }
         },
         "./*": {
            "require": {
               "types": "./*.d.ts",
               "default": "./cjs/*.js"
            },
            "import": {
               "types": "./*.d.ts",
               "default": "./*.js"
            }
         },
         "./cjs": null
      },
      dependencies,
      devDependencies
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}