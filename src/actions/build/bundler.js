import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import path from "path";
import fs from "fs/promises";
import { loadRollupConfig, loadViteConfig } from "../../helpers.js";
import dts from "rollup-plugin-dts";
import preserveDirectives from "rollup-plugin-preserve-directives";

const MAX_FILE_COPY_CONCURRENCY = 32;

// --------------------- Helpers ---------------------
function isCodeFile(filename) {
   return /\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(filename);
}

function isSkippedDir(name) {
   return ["node_modules", ".git", ".next"].includes(name);
}

// --------------------- Parallel asset copy ---------------------
async function copyAssetsBatched(rootdir, outdir) {
   const queue = [];

   async function walk(dir) {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
         const full = path.join(dir, item.name);
         const rel = path.relative(rootdir, full);
         if (rel.split(path.sep).some(isSkippedDir)) continue;

         if (item.isDirectory()) await walk(full);
         else if (!isCodeFile(item.name)) queue.push({ src: full, rel });
      }
   }

   await walk(rootdir);

   async function worker() {
      while (queue.length) {
         const { src, rel } = queue.shift();
         const dest = path.join(outdir, rel);
         await fs.mkdir(path.dirname(dest), { recursive: true });
         await fs.copyFile(src, dest);
      }
   }

   const workers = Array.from({ length: MAX_FILE_COPY_CONCURRENCY }, () => worker());
   await Promise.all(workers);
}


function normalizeInput(input, extraEntry) {
   const result = {};

   const add = (entry, name) => {
      const key = name || path.basename(entry).replace(/\.[^.]+$/, "");
      result[key] = path.resolve(process.cwd(), entry);
   };

   // rollupConfig.input
   if (typeof input === "string") {
      add(input);
   } else if (Array.isArray(input)) {
      input.forEach(i => add(i));
   } else if (input && typeof input === "object") {
      for (const [name, entry] of Object.entries(input)) {
         add(entry, name);
      }
   }

   // args.entry (CLI)
   if (extraEntry) {
      add(extraEntry);
   }

   return result;
}

// --------------------- Main Bundler ---------------------
async function bundler(args, spinner, child = false) {
   const rootdir = args.rootdir;
   const outdir = args.outdir;

   const viteConfig = await loadViteConfig();
   const rollupConfig = await loadRollupConfig();
   const viteRollupConfig = viteConfig?.build?.rollupOptions || {};
   Object.assign(rollupConfig || {}, viteRollupConfig);
   let input = {}
   if (rollupConfig && rollupConfig.input) {
      input = normalizeInput(rollupConfig.input, args.entry);
   }

   input["index"] = args.entry;


   const config = {
      ...rollupConfig,
      input,
      external: id => {
         if (rollupConfig && typeof rollupConfig.external === "function") {
            if (rollupConfig.external(id)) return true;
         }
         if (Array.isArray(rollupConfig && rollupConfig.external)) {
            if (rollupConfig.external.includes(id)) return true;
         }

         return !id.startsWith(".") && !id.startsWith("/") && !/^[A-Za-z]:\\/.test(id);
      },
      plugins: [
         preserveDirectives(),
         json(),
         resolve({ extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".mjs", ".cjs"] }),
         commonjs(),
         typescript({
            tsconfig: false,
            target: "ES2017",
            module: "ESNext",
            jsx: "react-jsx",
            moduleResolution: "node",
            esModuleInterop: true,
            strict: true,
            importHelpers: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            declaration: false,
            emitDeclarationOnly: false,
            rootDir: path.resolve(process.cwd(), rootdir)
         }),
         args.minify ? terser({
            compress: {
               directives: false
            }
         }) : null,
         ...(rollupConfig?.plugins || [])
      ]
   };

   const bundle = await rollup(config);

   // --------------------- Output formats ---------------------
   const outputs = []
   const isModern = args.format === "modern";
   const formats = isModern ? ["esm", "cjs"] : [args.format];

   for (let f of formats) {

      if (f === "esm" || f === "cjs") {
         let ext = isModern ? f === "esm" ? "js" : "cjs" : "js"
         outputs.push({
            dir: outdir,
            format: f,
            sourcemap: args.sourcemap,
            preserveModules: true,
            preserveModulesRoot: rootdir,
            entryFileNames: `[name].${ext}`,
         });
      } else if (f === "iife" || f === "umd") {
         outputs.push({
            dir,
            format: f,
            name: args.name || "Bundle",
            sourcemap: args.sourcemap,
            entryFileNames: "[name].js",
         });
      }
   }

   for (const output of outputs) {
      await bundle.write(output);
   }

   await bundle.close();

   // --------------------- Copy assets ---------------------
   if (!child) {
      spinner.text = "📁 Copying non-code assets...";
      await copyAssetsBatched(rootdir, outdir);
   }

   if (args.declaration) {
      spinner.text = "Generating TypeScript declarations..."
      const bundlets = await rollup({
         ...config,
         plugins: [dts()],
      });
      await bundlets.write({
         preserveModules: true,
         preserveModulesRoot: args.rootdir,
         dir: path.join(args.outdir),
      });
      await bundlets.close();
   }
}

export default bundler;
