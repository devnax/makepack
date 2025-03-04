import fs from 'fs-extra'
import path from 'path'

export default async () => {
   const readme = fs.readFileSync(path.join(process.cwd(), 'readme.md'), 'utf-8')
   const content = readme
   return {
      content,
      filename: `readme.md`
   }
}