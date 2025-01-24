import { loadConfig } from "../../../helpers.js"

export default async () => {
   const config = await loadConfig()
   return {
      content: `node_modules\n${config.build.outdir}`,
      filename: ".gitignore"
   }
}