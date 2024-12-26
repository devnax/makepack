import child_process from 'child_process'
import path from 'path';
import { fileURLToPath } from 'url'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

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