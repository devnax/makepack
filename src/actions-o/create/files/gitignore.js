import makepackConfig from "../../../makepack-config.js"

export default async () => {
   const config = await makepackConfig()
   return {
      content: `node_modules\n${config.build.outdir}`,
      filename: ".gitignore"
   }
}