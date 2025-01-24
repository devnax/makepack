import child_process from 'child_process'
import chalk from 'chalk';
import figures from 'figures';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs-extra';
import react from '@vitejs/plugin-react'
import ts from 'typescript'


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


export const loadConfig = async () => {
   const makepack = path.resolve(process.cwd(), "makepack.js");
   let esbuild = {
      sourcemap: true,
      jsx: 'automatic',
      loader: {
         '.ts': 'ts',
         '.tsx': 'tsx'
      },
   }

   const defaultConfig = {
      build: {
         outdir: "dist",
         tsconfig: {
            declaration: true,
            emitDeclarationOnly: true,
            // outDir: path.join(process.cwd(), args.outdir || "build", 'types'),
            strict: true,
            allowJs: true,
            jsx: ts.JsxEmit.React,
            esModuleInterop: true,
         },
         esm: esbuild,
         cjs: esbuild,
      },
      serve: {
         express: () => { },
         vite: {
            root: process.cwd(),
            plugins: [react()],
            server: {
               middlewareMode: true,
            },
            customLogger: {
               info: (msg) => {
                  logger.info(msg)
               },
               warn: (msg) => logger.warning(msg),
               error: (msg) => logger.error(msg),
            },
            appType: 'custom'
         }
      }
   }

   if (fs.existsSync(makepack)) {
      try {
         const c = await import(pathToFileURL(makepack).href)
         const configFn = c.default
         if (typeof configFn === 'function') {
            return configFn(defaultConfig)
         }
      } catch (error) {
         console.log(error);

      }
   }
   return defaultConfig
}