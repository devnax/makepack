import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default (args) => {
   // load readme.md content from rootdir
   const readme = fs.readFileSync(path.resolve(__dirname, '../../../../readme.md'), 'utf-8')
   const content = readme
   return {
      content,
      filename: `readme.md`
   }
}