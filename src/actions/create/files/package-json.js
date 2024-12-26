export default (args) => {
   let dependencies = {}
   let devDependencies = {
      "makepack": "latest"
   }

   if (args.template.includes("react")) {
      dependencies = {
         "react": "^19.0.0",
         "react-dom": "^19.0.0"
      }
   }

   if (args.template.includes("typescript")) {
      devDependencies["typescript"] = "^4.4.2"
      devDependencies["@types/react"] = "^19.0.2"
      devDependencies["@types/react-dom"] = "^19.0.2"
   }

   const json = {
      name: args.diraname,
      version: "1.0.0",
      description: "",
      main: `${args.outdir}/${args.entry}`,
      scripts: {
         "start": "makepack serve",
         "build": "makepack build",
      },
      dependencies,
      devDependencies,
      keywords: [],
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}