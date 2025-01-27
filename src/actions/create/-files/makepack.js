export default async (args) => {
   const makepack = {
      "template": `${args.template}`,
      "serve": {
         "port": 3000,
         "entry": `${args.rootdir}/${args.entry}`
      },
      "build": {
         "entry": `${args.rootdir}/**/*.{tsx,ts,js,jsx}`,
         "outdir": `${args.outdir}`,
         "esbuild": {
         }
      },
   }
   return {
      content: `const makepack = ${JSON.stringify(makepack, null, 2)}\nexport default makepack\n`,
      filename: "makepack.js"
   }
}
