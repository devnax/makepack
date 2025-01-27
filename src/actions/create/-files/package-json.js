import { loadConfig } from "../../../helpers.js"

export default async (args) => {
   const config = await loadConfig()
   let dependencies = {}
   let devDependencies = {
      "makepack": "latest",
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
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
      main: `./${config.build.outdir}/cjs/index.js`,
      module: `./${config.build.outdir}/index.js`,
      types: `./${config.build.outdir}/index.d.ts`,
      description: "",
      keywords: [],
      files: [
         config.build.outdir
      ],
      exports: {
         ".": {
            "types": `./${config.build.outdir}/index.d.ts`,
            "import": `./${config.build.outdir}/index.js`,
            "require": `./${config.build.outdir}/cjs/index.js`
         },
         "./*": {
            "import": `./${config.build.outdir}/*.js`,
            "require": `./${config.build.outdir}/cjs/*.js`
         }
      },
      scripts: {
         "start": "makepack serve",
         "build": "makepack build",
         "prepare": "npm run build",
      },
      dependencies,
      devDependencies
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}