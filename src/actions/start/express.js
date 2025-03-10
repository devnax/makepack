import express from 'express';
import { logger } from '../../helpers.js'
import chalk from 'chalk';
import makepackConfig from '../../makepack-config.js';
import viteSetup from './vite.js';
import userExpress from './user-express.js';
import path from 'path';

const app = express();
const server = async () => {
   const config = await makepackConfig()
   userExpress(app)
   await viteSetup(app)
   app.use(express.static(path.join(process.cwd(), 'public')));
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