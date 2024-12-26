import inquirer from 'inquirer'
import { createServer as createViteServer } from 'vite';
import express from 'express';

const app = express();

const serve = async (args) => {
   if (args.entry === undefined) {
      const { entry } = await inquirer.prompt([{
         type: 'input',
         name: 'entry',
         message: 'Enter the root file',
         default: 'src/index.js'
      }]);
      args.entry = entry;
   }

   let template = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Xanos</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="${args.entry}"></script>
        </body>
      </html>
  `;

   const vite = await createViteServer({
      root: process.cwd(),
      // plugins: [react()],
      server: {
         middlewareMode: true
      },
      appType: 'custom'
   });

   app.use(vite.middlewares);
   app.get('/', async (req, res, next) => {
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

   app.use('*', async (_req, res) => {
      res.status(404).end("404 page not found");
   });

   app.listen(args.port, () => console.log(`http://localhost:${args.port}`));
}

export default serve