import path from 'path'
import fs from 'fs-extra'
import { pathToFileURL } from 'url';

const makapeckConfig = async () => {
   const makepack = path.resolve(process.cwd(), "makepack.js");

   const defaultConfig = {
      build: {
         outdir: "build",
         types: true,
         formatPackageJson: (p) => p,
         configs: [
            {
               entryPoints: "test/**/*.{tsx,ts,js,jsx}",
               outdir: "esm",
               format: "esm",
               sourcemap: true,
               jsx: 'automatic',
               loader: {
                  '.ts': 'ts',
                  '.tsx': 'tsx'
               },
            },
            {
               entryPoints: "test/**/*.{tsx,ts,js,jsx}",
               outdir: "",
               format: "cjs",
               sourcemap: true,
               jsx: 'automatic',
               loader: {
                  '.ts': 'ts',
                  '.tsx': 'tsx'
               },
            }
         ]
      },
      server: {
         port: 5000,
         root: "server.ts"
      }
   }

   if (fs.existsSync(makepack)) {
      try {
         const c = await import(pathToFileURL(makepack).href)
         const configFn = c.default
         if (typeof configFn === 'function') {
            const nc = configFn(defaultConfig)
            if (!nc) {
               console.log("Config function must return a config object")
               process.exit(1)
            }
            return nc
         }
      } catch (error) {
         console.log(error);
      }
   }
   return defaultConfig
}

export default makapeckConfig