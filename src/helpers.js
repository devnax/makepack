import child_process from 'child_process'
import chalk from 'chalk';
import figures from 'figures';

export const logLoader = (message = "") => {
   const spinner = ['|', '/', '-', '\\'];
   let i = 0;
   const interval = setInterval(() => {
      process.stdout.write(`\r${message} ${spinner[i]}`);
      i = (i + 1) % spinner.length;
   }, 100);

   return {
      stop: (msg) => {
         clearInterval(interval);
         !!msg && console.log(`\r${msg}`);
         process.stdout.write(`\r`);
      }
   }
}

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

