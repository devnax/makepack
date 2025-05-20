
export default async (info) => {
   let dependencies = {}
   let devDependencies = {
      "makepack": "latest",
      "express": "latest"
   }

   if (info.template.includes("react")) {
      dependencies["react"] = "^19.0.0"
      dependencies["react-dom"] = "^19.0.0"
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
      main: `./index.cjs`,
      module: `./index.mjs`,
      types: `./index.d.ts`,
      description: "",
      keywords: [],
      sideEffects: false,
      // "exports": {
      //    ".": {
      //       "types": "./types/index.d.ts",
      //       "require": "./cjs/index.js",
      //       "import": "./index.js",
      //    },
      //    "./types/*": "./types/*.d.ts",
      //    "./cjs/*": "./cjs/*.js",
      //    "./*": {
      //       "import": "./*.js",
      //       "require": "./cjs/*.js"
      //    }
      // },
      scripts: {
         "start": "makepack start",
         "build": "makepack build",
         "publish": "makepack publish"
      },
      dependencies,
      devDependencies
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}