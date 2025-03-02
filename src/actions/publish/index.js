import path from 'path'
import { execSync, logger } from '../../helpers.js'
import makepackConfig from '../../makepack-config.js'

const publish = async () => {
   const { build } = await makepackConfig()
   const buildDir = path.join(process.cwd(), build.outdir)
   const exists = fs.existsSync(buildDir)
   if (!exists) {
      logger.error(`Build directory ${buildDir} does not exist. Please build the project first`)
      process.exit(1)
   }
   logger.info(`Publishing the production build to the npm repository...`)
   execSync(`npm publish`, {
      cwd: path.join(process.cwd(), build.outdir)
   })
}

export default publish