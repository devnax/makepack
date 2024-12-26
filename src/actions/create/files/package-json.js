export default (args) => {
   let dependencies = {}
   let devDependencies = {
      "makepack": "latest"
   }

   if (args.template.includes("react")) {
      dependencies = {
         "react": "^17.0.2",
         "react-dom": "^17.0.2"
      }
   }

   if (args.template.includes("typescript")) {
      devDependencies["typescript"] = "^4.4.2"
      devDependencies["@types/react"] = "^18.3.12"
      devDependencies["@types/react-dom"] = "^18.3.1"
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