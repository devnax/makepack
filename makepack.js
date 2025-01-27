const config = {
   build: {
      outdir: "dist",
      configs: {
         esm: {
            entry: "src/**/*.{tsx,ts,js,jsx}",
            publish: false
         },
         cjs: {
            entry: "src/**/*.{tsx,ts,js,jsx}",
            publish: false
         },
         umd: {
            entry: "src/**/*.{tsx,ts,js,jsx}",
            publish: false
         },
      },
      types: {
         entry: "src/index.ts",
         publish: false
      }
   },
   server: {
      port: 5000,
      root: "serve.ts"
   }
}