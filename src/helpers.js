import child_process from 'child_process'
import chalk from 'chalk';
import figures from 'figures';

export const execSync = (command, option = {}) => {
   try {
      const result = child_process.execSync(command, {
         encoding: "utf-8",
         stdio: 'inherit',
         ...option
      });
      result && console.log(result);
   } catch (error) {
      console.error(`Command failed: ${error.message}`);
      process.exit(1);
   }
};



export const logger = {
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