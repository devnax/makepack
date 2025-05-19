import fs from 'fs-extra'
import path from 'path'
import { logger } from '../../helpers.js'
import makepackConfig from '../../makepack-config.js';
import esbuild from 'esbuild';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
let __filename, __dirname;

if (typeof import.meta.url !== 'undefined') {
   __filename = fileURLToPath(import.meta.url);
   __dirname = path.dirname(__filename);
} else {
   __filename = __filename;
   __dirname = __dirname;
}

let server = null;
function startServer() {
   if (server) {
      server.kill('SIGINT');
      server = null;
   }
   server = spawn('node', [path.resolve(__dirname, 'express.js')], {});
   server.stdout.on('data', (data) => {
      console.log(data.toString().trim());
   });
   server.stderr.on('data', (data) => {
      console.error(data.toString().trim());
   });
}

const start = async () => {
   const config = await makepackConfig()
   const exists = fs.existsSync(path.join(process.cwd(), config.start.entry))
   if (!exists) {
      logger.error(`Entry file ${entry} does not exist. please check your config file`)
      process.exit(1)
   }

   const expressjs = path.join(process.cwd(), 'express.js')
   const expressts = path.join(process.cwd(), 'express.ts')

   if (fs.existsSync(expressjs) || fs.existsSync(expressts)) {
      let filename = fs.existsSync(expressjs) ? "express.js" : "express.ts";
      let outfile = path.resolve(__dirname, 'user-express.js')

      const ctx = await esbuild.context({
         entryPoints: [filename],
         outfile: path.resolve(__dirname, 'user-express.js'),
         bundle: true,
         format: 'esm',
         platform: 'node',
         packages: 'external',
      })

      ctx.watch()

      const watcher = chokidar.watch(outfile, {
         persistent: true,
         ignoreInitial: true,
      });

      watcher.on('change', async () => {
         startServer(config)
      });

      process.on('SIGINT', async () => {
         watcher.close();
         process.exit(0);
      });
   }
   startServer(config)
}

export default start