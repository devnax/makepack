import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { builtinModules } from "module";
import fs from "fs";
import path from "path";
import dts from "rollup-plugin-dts";
import json from '@rollup/plugin-json';
import terser from "@rollup/plugin-terser";

async function bundler(args, spinner) {
   const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
   const external = [
      ...builtinModules,
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
   ];

   const isTs = args.entry.endsWith(".ts")

   const config = {
      input: [args.entry],
      external,
      plugins: [
         json(),
         resolve(),
         commonjs(),
         isTs ? typescript({
            compilerOptions: {
               "module": "ESNext",
               "jsx": "react",
               "strict": true,
               "forceConsistentCasingInFileNames": true,
               "esModuleInterop": true
            },
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: ["node_modules", ".mpack"],
         }) : null,
         args.minify ? terser() : null,
      ]
   };

   const bundle = await rollup(config);
   const esm = {
      dir: args.outdir,
      format: "esm",
      sourcemap: args.sourcemap,
      compact: true,
      strict: true
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
         dir: path.join(args.outdir),
      });
      await bundlets.close();
   }
}

export default bundler;