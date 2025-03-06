import fs from 'fs-extra'
import path from 'path'
import { createServer as createViteServer } from 'vite';
import express from 'express';
import react from '@vitejs/plugin-react'
import { logger } from '../../helpers.js'
import chalk from 'chalk';
import figlet from 'figlet';
import makepackConfig from '../../makepack-config.js';

const app = express();

const start = async (args) => {
   const config = await makepackConfig()
   const exists = fs.existsSync(path.join(process.cwd(), config.start.entry))
   if (!exists) {
      logger.error(`Entry file ${entry} does not exist. please check your config file`)
      process.exit(1)
   }

   let template = `
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
  `;

   const viteConfig = {
      root: process.cwd(),
      plugins: [react()],
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

   if (config.start.express) {
      config.start.express(app)
   }

   app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
         template = await vite.transformIndexHtml(url, template);
         res.status(200).set({
            'Content-Type': 'text/html'
         }).end(template);
      } catch (e) {
         vite.ssrFixStacktrace(e);
         next(e);
      }
   });

   app.use((_req, res) => {
      res.status(500).send('Internal Server Error');
   });

   let server = app.listen(config.start.port, () => {
      figlet("Makepack", function (err, data) {
         if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            server.close(() => {
               console.log('Server has been stopped.');
            });
            process.exit()
         }
         console.log(data);
         logger.success(`Server is running on ${chalk.blue(chalk.underline(`http://localhost:${config.start.port}`))}`);
      });
   });
}

export default start