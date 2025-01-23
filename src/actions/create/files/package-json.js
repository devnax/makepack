export default (args) => {
   let dependencies = {}
   let devDependencies = {
      "makepack": "latest"
   }

   if (args.template.includes("react")) {
      dependencies["react"] = "^19.0.0"
      dependencies["react-dom"] = "^19.0.0"
   } else {
      devDependencies["react"] = "^19.0.0"
      devDependencies["react-dom"] = "^19.0.0"
   }

   if (args.template.includes("typescript")) {
      devDependencies["typescript"] = "^4.4.2"
      devDependencies["@types/react"] = "^19.0.2"
      devDependencies["@types/react-dom"] = "^19.0.2"
   }

   let main = args.entry.split('.')
   main.pop()

   const json = {
      name: args.dirname,
      version: "1.0.0",
      description: "",
      main: `./${main.join(".")}.js`,
      scripts: {
         "start": "makepack serve",
         "pack": "makepack pack",
         "publish:pack": "makepack pack -p",
      },
      dependencies,
      devDependencies,
      keywords: [],
      exports: {
         ".": {
            "types": "./types/index.d.ts",
            "import": "./esm/index.js",
            "require": "./cjs/index.js"
         },
         "./*": {
            "types": "./types/*.d.ts",
            "import": "./esm/*.js",
            "require": "./cjs/*.js"
         },
         "./types/*": "./types/*.d.ts",
         "./esm/*": "./esm/*.js",
         "./esm/*.js": "./esm/*.js",
         "./cjs/*": "./cjs/*.js",
         "./cjs/*.js": "./cjs/*.js"
      }
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}