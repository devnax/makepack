// import react from '@vitejs/plugin-react'
import { createServer as createViteServer } from 'vite';
import { loadViteConfig, logger } from '../../helpers.js'
import path from 'path';
import fs from 'fs';

const viteSetup = async (app) => {
   const config = await loadViteConfig() || {}

   // delete .vite directory if exists
   const viteDir = path.join(process.cwd(), 'node_modules/.vite');
   if (fs.existsSync(viteDir)) {
      fs.rmSync(viteDir, { recursive: true, force: true });
   }

   const viteConfig = {
      ...config,
      configFile: false,
      root: process.cwd(),
      base: "/",
      // plugins: [react()],
      server: {
         ...config?.server,
         middlewareMode: true,
      },
      customLogger: {
         info: (msg) => {
            logger.info(msg)
         },
         warn: (msg) => logger.warning(msg),
         error: (msg) => logger.error(msg),
      },
      appType: 'custom'
   }

   const vite = await createViteServer(viteConfig);
   app.use(vite.middlewares);

   // exists tsconfig.json in the root directory
   const isTs = fs.existsSync(path.resolve(process.cwd(), 'main.tsx'))
   let entry = `/main.${isTs ? "tsx" : "jsx"}`

   app.get('*', async (req, res, next) => {
      const url = req.originalUrl;

      try {
         let template = await vite.transformIndexHtml(url, `
            <!doctype html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              </head>
              <body>
                <div id="root"></div>
                <script type="module" src="${entry}"></script>
              </body>
            </html>
        `);

         res.status(200).set({
            'Content-Type': 'text/html'
         }).end(template);
      } catch (e) {
         vite.ssrFixStacktrace(e);
         next(e);
      }
   });
   return vite;
}


export default viteSetup