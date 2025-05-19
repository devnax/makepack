import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

let __filename, __dirname;

if (typeof import.meta.url !== 'undefined') {
   __filename = fileURLToPath(import.meta.url);
   __dirname = path.dirname(__filename);
} else {
   __filename = __filename;
   __dirname = __dirname;
}


const startServer = () => {
   const mpack = path.join(process.cwd(), '.mpack')
   const server = spawn('node', [path.resolve(mpack, 'index.js')], {
      stdio: 'inherit',
   });

   server.on('error', (err) => {
      console.error(`Error starting server: ${err.message}`);
   });
   return server;
}

const start = async (args) => {
   let { port } = args

   if (!port) {
      port = 4000;
   }
   // create a folder call .mpack
   const mpack = path.join(process.cwd(), '.mpack')
   if (fs.existsSync(mpack)) {
      // remove .mpack folder
      fs.rmSync(mpack, { recursive: true, force: true });
   }
   fs.mkdirSync(mpack)


   // build ./express.js to .mpack/index.js with esbuild
   let format = 'esm'
   // get format from package.json
   const pkg = path.join(process.cwd(), 'package.json')
   if (fs.existsSync(pkg)) {
      const pkgjson = JSON.parse(fs.readFileSync(pkg, 'utf-8'))
      if (pkgjson.type === 'commonjs') {
         format = 'cjs'
      }
   }

   const uExpressjs = path.join(process.cwd(), 'express.js')
   const uExpressts = path.join(process.cwd(), 'express.ts')

   if (fs.existsSync(uExpressjs) || fs.existsSync(uExpressts)) {
      let filename = fs.existsSync(uExpressjs) ? "express.js" : "express.ts";
      let outfile = path.join(mpack, 'uxp.js');

      const ctx = await esbuild.context({
         entryPoints: [filename],
         outfile,
         bundle: true,
         format: 'esm',
         platform: 'node',
         packages: 'external',
      })
      ctx.watch()
   }

   await esbuild.build({
      entryPoints: [path.resolve(__dirname, 'express.js')],
      outfile: path.join(mpack, 'index.js'),
      bundle: true,
      format,
      platform: 'node',
      packages: 'external',
      define: {
         'process.env.PORT': JSON.stringify(port),
      },
   })

   let server = startServer();

   const userExpress = path.join(mpack, 'uxp.js')

   if (fs.existsSync(userExpress)) {
      const watcher = chokidar.watch(userExpress, {
         persistent: true,
         ignoreInitial: true,
      });

      watcher.on('change', async () => {
         // restart the server and remove log Server exited with code
         server.kill();
         server = startServer();
      });
   }

   process.on('SIGINT', () => {
      console.log('Received SIGINT, killing server...');
      server.kill('SIGINT');
      process.exit(0);
   });

   process.on('SIGTERM', () => {
      console.log('Received SIGTERM, killing server...');
      server.kill('SIGTERM');
      process.exit(0);
   });

}


export default start