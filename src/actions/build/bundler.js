import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import dts from "rollup-plugin-dts";
import json from '@rollup/plugin-json';
import terser from "@rollup/plugin-terser";

async function bundler(args, spinner) {
   const isTs = args.entry.endsWith('.ts') || args.entry.endsWith('.tsx')

   const config = {
      input: [args.entry],
      external: (id) => {
         return !id.startsWith('.') && !id.startsWith('/') && !/^[A-Za-z]:\\/.test(id);
      },
      plugins: [
         json(),
         resolve({
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.mjs', '.cjs'],
            browser: false
         }),
         commonjs(),
         typescript({
            tsconfig: false,
            target: "ES2017",
            module: "ESNext",
            jsx: "react-jsx",
            moduleResolution: "node", // ✅ Correct and lowercase
            esModuleInterop: true,
            skipLibCheck: false,
            strict: true,
            importHelpers: true,
            forceConsistentCasingInFileNames: true,
            declaration: false,
            emitDeclarationOnly: false,
            rootDir: path.resolve(process.cwd(), args.rootdir),
         }),
         args.minify ? terser() : null,
      ]
   };

   const bundle = await rollup(config);
   const esm = {
      dir: args.outdir,
      format: "esm",
      sourcemap: args.sourcemap,
      compact: true,
      strict: true,
      exports: "named"
   };
   if (!args.bundle) {
      esm.preserveModules = true
      esm.preserveModulesRoot = args.rootdir
   }

   let cjs = {
      ...esm,
      dir: args.outdir,
      format: "cjs",
      dynamicImportInCjs: true,
      esModule: true,
   }

   let outputOptions = []

   if (args.format === "both") {
      outputOptions = [
         { ...esm, entryFileNames: '[name].mjs' },
         cjs,
      ]
   } else if (args.format === "esm") {
      outputOptions = [esm];
   } else if (args.format === "cjs") {
      outputOptions = [cjs];
   } else if (args.format === "iife") {
      outputOptions = [{
         ...esm,
         format: "iife",
         name: args.name || path.basename(args.entry, path.extname(args.entry)),
         entryFileNames: '[name].js',
      }];
   } else if (args.format === "umd") {
      outputOptions = [{
         ...esm,
         format: "umd",
         name: args.name || path.basename(args.entry, path.extname(args.entry)),
         entryFileNames: '[name].js',
      }];
   }

   for (const output of outputOptions) {
      await bundle.write(output);
   }
   await bundle.close();

   // If TypeScript declaration files are requested, generate them
   if (isTs && args.declaration) {
      spinner.text = "Generating TypeScript declarations..."
      const bundlets = await rollup({
         ...config,
         plugins: [dts()],
      });
      await bundlets.write({
         format: "esm",
         preserveModules: true,
         preserveModulesRoot: args.rootdir,
         dir: path.join(args.outdir),
      });
      await bundlets.close();
   }
}

export default bundler;