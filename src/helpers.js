import child_process from 'child_process'
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';


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


export const conicon = {
   info: 'ℹ',
   success: '✔',
   warning: '⚠',
   error: '✖',
};

export const concolor = {
   red: (str) => `\x1b[31m${str}\x1b[0m`,
   green: (str) => `\x1b[32m${str}\x1b[0m`,
   yellow: (str) => `\x1b[33m${str}\x1b[0m`,
   blue: (str) => `\x1b[34m${str}\x1b[0m`,
   bold: (str) => `\x1b[1m${str}\x1b[0m`,
   dim: (str) => `\x1b[2m${str}\x1b[0m`,
};


export const logger = {
   log: (message, prefix, icon, color) => {
      let _color = concolor[color] || concolor.reset;
      let _icon = conicon[icon] || '';
      prefix = prefix ? _color(concolor.bold(prefix)) : "";
      console.log(`${_icon ? _color(_icon) + " " : ""}${prefix} ${message}`);
   },
   info: (message, prefix = 'INFO', icon = true) => {
      logger.log(message, prefix, icon ? 'info' : '', 'blue');
   },
   success: (message, prefix = 'SUCCESS:', icon = true) => {
      logger.log(message, prefix, icon ? 'success' : '', 'green');
   },
   warning: (message, prefix = 'WARNING:', icon = true) => {
      logger.log(message, prefix, icon ? 'warning' : '', 'yellow');
   },
   error: (message, prefix = 'ERROR:', icon = true) => {
      logger.log(message, prefix, icon ? 'error' : '', 'red');
   }
};


/**
 * Load full Vite config object from root
 */
export async function loadViteConfig() {
   // List of common Vite config files
   const possibleFiles = [
      'vite.config.js',
      'vite.config.ts',
      'vite.config.mjs',
      'vite.config.cjs',
   ];

   for (const file of possibleFiles) {
      const configPath = path.resolve(process.cwd(), file);

      try {
         await fs.access(configPath); // check if file exists
      } catch {
         continue; // file doesn't exist, try next
      }

      try {
         const imported = await import(pathToFileURL(configPath).href);
         return imported.default || imported; // return full config object
      } catch (err) {
         console.error(`Failed to load ${file}:`, err);
         return null;
      }
   }

   return null; // no config found
}


export async function loadRollupConfig() {
   const possibleFiles = [
      'rollup.config.js',
      'rollup.config.mjs',
      'rollup.config.cjs',
   ];

   for (const file of possibleFiles) {
      const configPath = path.resolve(process.cwd(), file);

      try {
         await fs.access(configPath); // check if file exists
      } catch {
         continue; // file doesn't exist, try next
      }

      try {
         const imported = await import(pathToFileURL(configPath).href);
         return imported.default || imported; // return full config object
      } catch (err) {
         console.error(`Failed to load ${file}:`, err);
         return null;
      }
   }

   return null;
}
