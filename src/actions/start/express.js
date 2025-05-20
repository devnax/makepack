import express from 'express';
import { logger } from '../../helpers.js'
import chalk from 'chalk';
import path from 'path'
import fs from 'fs'
import viteSetup from './vite.js';
const port = process.env.PORT || 3000;
const app = express();
const server = async () => {

   // get type from package.json
   const pkg = path.join(process.cwd(), 'package.json');
   let type = 'module';
   if (fs.existsSync(pkg)) {
      const pkgjson = JSON.parse(fs.readFileSync(pkg, 'utf-8'));
      type = pkgjson.type || 'module';
   }

   const mpack = path.join(process.cwd(), '.mpack');
   const uxp = path.join(mpack, 'uxp.js')
   if (fs.existsSync(uxp)) {
      // load user-express.js based on type
      if (type === 'module') {
         const { default: userExpress } = await import(uxp);
         userExpress(app);
      } else {
         const userExpress = require(uxp).default;
         userExpress(app);
      }
   }


   await viteSetup(app)
   app.use((_req, res) => {
      res.status(500).send('Internal Server Error');
   });

   app.listen(port, () => {
      logger.success(`Server is running on ${chalk.blue(chalk.underline(`http://localhost:${port}`))}`);
   });
}

server()