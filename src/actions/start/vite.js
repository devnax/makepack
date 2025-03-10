// import react from '@vitejs/plugin-react'
import { createServer as createViteServer } from 'vite';
import { logger } from '../../helpers.js'
import makepackConfig from '../../makepack-config.js';

const viteSetup = async (app) => {
   const config = await makepackConfig()
   const viteConfig = {
      root: process.cwd(),
      base: "/",
      // plugins: [react()],
      server: {
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
                <script type="module" src="${config.start.entry}"></script>
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
}


export default viteSetup