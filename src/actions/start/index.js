import express from 'express';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { createRequire } from 'module';
import chokidar from 'chokidar';
import madge from 'madge';
import viteSetup from './vite.js';
import * as esbuild from 'esbuild';
import { randomUUID } from 'crypto';
import debounce from 'lodash.debounce';
import { logger, concolor, loadViteConfig } from '../../helpers.js';

const projectRoot = process.cwd();
const requireFn = createRequire(import.meta.url);
const mpack = path.join(projectRoot, '.mpack');

let server = null;
let app = null;
let viteServer = null;

const pkg = path.join(process.cwd(), 'package.json');
const pkgjson = JSON.parse(fs.readFileSync(pkg, 'utf-8'));
let isEsmProject = pkgjson.type === 'module';

const uxpfileJS = path.resolve(projectRoot, 'express.js');
const uxpfileTS = path.resolve(projectRoot, 'express.ts');
const expExists = fs.existsSync(uxpfileJS) || fs.existsSync(uxpfileTS);
let uxpfile = expExists ? (fs.existsSync(uxpfileJS) ? uxpfileJS : uxpfileTS) : null;

const connections = new Set();

function safeHandler(fn) {
   return (req, res, next) => {
      try {
         const result = fn(req, res, next);
         if (result && typeof result.catch === 'function') {
            result.catch(next);
         }
      } catch (err) {
         logger.error(`Error in request handler: ${err.message || err}`);
         res.status(500).send('Internal Server Error');
         // next();
      }
   };
}

function trackConnections(srv) {
   srv.on('connection', (conn) => {
      connections.add(conn);
      conn.on('close', () => connections.delete(conn));
   });
}

async function bootServer(args) {
   let wasServer = !!server;
   if (server) {
      for (const conn of connections) {
         conn.destroy();
      }
      await new Promise((resolve, reject) => {
         server.close(err => {
            if (err) {
               logger.error(`while closing server: ${err.message || err}`);
               reject(err);
            } else {
               resolve();
            }
         });
      });
      server = null;
   }

   if (viteServer) {
      await viteServer.close();
   }

   app = express();

   try {
      const middleware = await loadExp();
      if (typeof middleware === 'function') {
         const _get = app.get.bind(app);
         const _post = app.post.bind(app);
         const _delete = app.delete.bind(app);
         const _put = app.put.bind(app);

         app.get = (path, ...handlers) => {
            handlers = handlers.map(h => safeHandler(h));
            return _get(path, ...handlers);
         };

         app.post = (path, ...handlers) => {
            handlers = handlers.map(h => safeHandler(h));
            return _post(path, ...handlers);
         };

         app.put = (path, ...handlers) => {
            handlers = handlers.map(h => safeHandler(h));
            return _put(path, ...handlers);
         };

         app.delete = (path, ...handlers) => {
            handlers = handlers.map(h => safeHandler(h));
            return _delete(path, ...handlers);
         };
         middleware(app);
      }
      const config = await loadViteConfig() || {}
      viteServer = await viteSetup(app);
      const port = args.port || config?.server?.port || 4000;
      server = app.listen(port, () => {
         if (!wasServer) {
            logger.success(`Server running on: ${concolor.green(concolor.bold(`http://localhost:${port}`))}`, '')
         }
         trackConnections(server);
      })
   } catch (err) {
      logger.error(`Failed to start server: ${err.message || err}`);
   }
}

let esbuildCtx = null;

const buildFile = path.join(mpack, `${randomUUID().substring(0, 15)}.js`);

async function loadExp() {
   if (!expExists) return null

   const cacheKeys = Object.keys(requireFn.cache || {});
   if (!isEsmProject) {
      for (const key of cacheKeys) {
         if (key.startsWith(process.cwd())) {
            delete requireFn.cache[key];
         }
      }
   }

   const ext = path.extname(uxpfile);
   const isTs = ext === '.ts' || ext === '.tsx';

   if (isTs) {
      if (esbuildCtx) {
         await esbuildCtx.rebuild();
      } else {
         esbuildCtx = await esbuild.context({
            entryPoints: [uxpfile],
            outfile: buildFile,
            format: isEsmProject ? 'esm' : 'cjs',
            platform: 'node',
            sourcemap: 'inline',
            bundle: true,
            packages: 'external',
         });
         await esbuildCtx.rebuild();
      }

      if (isEsmProject) {
         const mod = await import(pathToFileURL(buildFile).href + `?update=${Date.now()}`);
         return mod.default || mod;
      } else {
         return requireFn(buildFile);
      }
   }

   if (isEsmProject) {
      const mod = await import(pathToFileURL(uxpfile).href + `?update=${Date.now()}`);
      return mod.default || mod;
   } else {
      return requireFn(uxpfile);
   }
}

async function getAllDependencies() {
   try {
      if (!expExists) {
         return [];
      }
      const result = await madge(uxpfile, { fileExtensions: ['ts', 'js'] });
      const deps = Object.keys(result.obj());
      // const circular = await result.circular();
      // if (circular.length) {
      //    logger.warning(`Circular dependencies detected: ${circular.map(c => c.join(' -> ')).join(', ')}`);
      // }
      return deps.map(dep => path.resolve(path.dirname(uxpfile), dep));
   } catch (err) {
      logger.error(`Failed to analyze dependencies with madge: ${err.message || err}`);
      return [uxpfile];
   }
}


let watcher;
async function startDevServer(args) {
   if (fs.existsSync(mpack)) {
      fs.rmSync(mpack, { recursive: true, force: true });
   }
   fs.mkdirSync(mpack, { recursive: true });

   await bootServer(args);
   const filesToWatch = await getAllDependencies();
   if (watcher) watcher.close();
   watcher = chokidar.watch(filesToWatch, { ignoreInitial: true });

   const reload = debounce(async (f) => {
      await bootServer(args);
      const prettyPath = concolor.dim(path.relative(process.cwd(), f));
      logger.info(`${concolor.green('server reload')} ${prettyPath}`);
   }, 100);

   watcher.on('change', reload);
   watcher.on('add', reload);
   watcher.on('unlink', reload);
}

export default startDevServer