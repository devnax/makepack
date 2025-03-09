import express from 'express';
import { logger } from '../../helpers.js'
import chalk from 'chalk';
import makepackConfig from '../../makepack-config.js';
import viteSetup from './vite.js';
import { cosmiconfig } from "cosmiconfig";

const app = express();
const server = async () => {
   const config = await makepackConfig()
   const explorer = cosmiconfig('express');
   const result = await explorer.load('.server/express.js');
   if (result) {
      if (typeof result.config !== 'function') {
         logger.error('Configuration file must export a function')
      }
      result.config(app)
   }

   await viteSetup(app)

   app.use((_req, res) => {
      res.status(500).send('Internal Server Error');
   });

   app.listen(config.start.port, () => {
      logger.success(`Server is running on ${chalk.blue(chalk.underline(`http://localhost:${config.start.port}`))}`);
   });

   process.on('SIGINT', async () => {
      process.exit(0);
   });
}

server()