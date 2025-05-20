import path from 'path'
import { execSync, logger } from '../../helpers.js'
import fs from 'fs-extra'

const release = async () => {
   const buildDir = path.join(process.cwd(), '.mpack')
   const packageJsonPath = path.join(buildDir, 'package.json')
   const exists = fs.existsSync(buildDir)
   if (!exists || !fs.existsSync(packageJsonPath)) {
      logger.error(`Project is not built yet. Please build the project first.`)
      process.exit(1)
   }

   logger.info(`Releaseing the production build to the npm repository...`)
   execSync(`npm publish`, {
      cwd: buildDir
   })
}

export default release