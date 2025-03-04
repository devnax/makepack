import { cosmiconfig } from "cosmiconfig";

const makepackConfig = async () => {
   const explorer = cosmiconfig("makepack");
   const configResult = await explorer.search();

   const defaultConfig = {
      build: {
         outdir: "build",
         types: true,
         formatPackageJson: (p) => p,
         configs: [
            {
               entryPoints: "src/**/*.{tsx,ts,js,jsx}",
               outdir: "",
               format: "esm",
               sourcemap: true,
               minify: true,
               jsx: 'automatic',
               loader: {
                  '.ts': 'ts',
                  '.tsx': 'tsx'
               },
            },
            {
               entryPoints: "src/**/*.{tsx,ts,js,jsx}",
               outdir: "cjs",
               format: "cjs",
               sourcemap: true,
               minify: true,
               jsx: 'automatic',
               loader: {
                  '.ts': 'ts',
                  '.tsx': 'tsx'
               },
            }
         ]
      },
      start: {
         port: 5000,
         entry: "App.tsx",
         express: (_app) => { }
      }
   }

   if (configResult && configResult.config) {
      let fn = configResult.config;
      if (typeof fn === 'function') {
         const userConfig = fn(defaultConfig)
         if (!userConfig) {
            console.log("Config function must return a config object")
            process.exit(1)
         }
         return userConfig
      }
   }
   return defaultConfig
}

export default makepackConfig