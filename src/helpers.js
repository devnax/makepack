import child_process from 'child_process'
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'
export const packageDir = process.cwd() + "/node_modules/xanos"
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

export const exec = (command) => {
   child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
         console.error("Error:", error);
         return;
      }
      console.log(stdout.toString());
      console.error("stderr:", stderr);
   });
};


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


export const packageJson = () => {
   try {
      const data = fs.readFileSync('./package.json', 'utf8');
      return JSON.parse(data);
   } catch (error) {
      console.error('Error reading package.json', error);
   }
}

