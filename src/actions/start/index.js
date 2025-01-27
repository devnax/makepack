import inquirer from 'inquirer'
import fs from 'fs-extra'
import path from 'path'
import { createServer as createViteServer } from 'vite';
import express from 'express';
import { glob } from 'glob'
import { logger, loadConfig } from '../../helpers.js'
import chalk from 'chalk';
import figlet from 'figlet';

const app = express();

const serve = async (args) => {
   if (args.root === undefined) {
      const serveFile = await glob('serve.{ts,js,tsx,jsx}', {
         cwd: process.cwd()
      })
      if (!serveFile.length) {
         let { root } = await inquirer.prompt([{
            type: 'input',
            name: 'root',
            message: 'Enter the root file',
         }]);

         if (!fs.existsSync(path.join(process.cwd(), root))) {
            throw new Error(`invalid root: ${root}`);
         }
         args.root = root;
      } else {
         args.root = serveFile[0];
      }
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
          <script type="module" src="${args.root}"></script>
        </body>
      </html>
  `;

   let config = await loadConfig(args)
   let serveConfig = config.serve || {}
   let viteConfig = serveConfig.vite || {}
   let express = serveConfig.express

   const vite = await createViteServer(viteConfig);
   app.use(vite.middlewares);

   if (express) {
      express(app)
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

   let server = app.listen(args.port, () => {
      figlet("Make build", function (err, data) {
         if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            server.close(() => {
               console.log('Server has been stopped.');
            });
            process.exit()
         }
         console.log(data);
         logger.success(`Server is running on ${chalk.blue(chalk.underline(`http://localhost:${args.port}`))}`);
      });
   });

   app.use((err, req, res, next) => {
      logger.error(`Unhandled Error: ${err.message}`);
      res.status(500).send('Internal Server Error');
   });
}

export default serve