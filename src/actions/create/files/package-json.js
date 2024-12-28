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

   let main = args.entry.split('.')
   main.pop()

   const json = {
      name: args.diraname,
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
   }

   return {
      content: JSON.stringify(json, null, 3),
      filename: "package.json"
   }
}