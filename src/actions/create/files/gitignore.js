export default (args) => {
   return {
      content: `node_modules\n$${args.outdir}`,
      filename: ".gitignore"
   }
}