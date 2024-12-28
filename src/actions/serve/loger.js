import chalk from 'chalk';
import figures from 'figures';

const logger = {
   info: (message, prefix = 'INFO', icon = true) => {
      console.log(`${icon ? chalk.blue(figures.info) + " " : ""}${chalk.cyan.bold(prefix)} ${message}`);
   },
   success: (message, prefix = 'SUCCESS:', icon = true) => {
      console.log(`${icon ? chalk.green(figures.tick) + " " : ""}${chalk.green.bold(prefix)} ${message}`);
   },
   warning: (message, prefix = 'WARNING:', icon = true) => {
      console.log(`${icon ? chalk.yellow(figures.warning) + " " : ""}${chalk.yellow.bold(prefix)} ${message}`);
   },
   error: (message, prefix = 'ERROR:', icon = true) => {
      console.log(`${icon ? chalk.red(figures.cross) + " " : ""}${chalk.red.bold(prefix)} ${message}`);
   },
   custom: (icon, color, label, message) => {
      console.log(`${chalk[color](icon)} ${chalk[color].bold(`${label}:`)} ${message}`);
   },
};

export default logger;
