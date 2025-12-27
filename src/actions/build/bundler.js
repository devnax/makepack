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

/**
 * Normalize rollup input (string | array | object)
 * → returns [{ entry, outdir }]
 */
function mapEntriesToOutdirs(entries, rootdir, baseOutdir) {
   const absRoot = path.resolve(process.cwd(), rootdir);
   const absOut = path.resolve(process.cwd(), baseOutdir);

   /** normalize to array of absolute entry paths */
   let entryList = [];

   // string
   if (typeof entries === "string") {
      entryList = [entries];
   }

   // array
   else if (Array.isArray(entries)) {
      entryList = entries;
   }

   // object { name: path }
   else if (entries && typeof entries === "object") {
      entryList = Object.values(entries);
   }

   return entryList.map(entry => {
      const absEntry = path.isAbsolute(entry)
         ? entry
         : path.resolve(process.cwd(), entry);

      // relative path from rootdir (e.g. anydir/entry.ts)
      const rel = path.relative(absRoot, absEntry);

      // directory only (e.g. anydir)
      const subdir = path.dirname(rel);

      return {
         entry: absEntry,
         outdir: subdir === "." ? absOut : path.join(absOut, subdir),
      };
   });
}

// --------------------- Main Bundler ---------------------
async function bundler(args, spinner, child = false) {
   const rootdir = args.rootdir;
   const outdir = args.outdir;

   const viteConfig = await loadViteConfig();
   const rollupConfig = await loadRollupConfig();
   const viteRollupConfig = viteConfig?.build?.rollupOptions || {};
   Object.assign(rollupConfig || {}, viteRollupConfig);

   const config = {
      ...rollupConfig,
      input: args.entry,
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
         args.minify ? terser() : null,
         ...(rollupConfig?.plugins || [])
      ]
   };

   const bundle = await rollup(config);



   // --------------------- Output formats ---------------------
   const outputs = [];
   if (!args.format || args.format === "both") {
      outputs.push({
         dir: outdir,
         format: "esm",
         sourcemap: args.sourcemap,
         preserveModules: true,
         preserveModulesRoot: rootdir,
         entryFileNames: "[name].mjs",
      });
      outputs.push({
         dir: outdir,
         format: "cjs",
         sourcemap: args.sourcemap,
         preserveModules: true,
         preserveModulesRoot: rootdir,
         entryFileNames: "[name].js",
      });
   } else if (args.format === "esm" || args.format === "cjs") {
      outputs.push({
         dir: outdir,
         format: args.format,
         sourcemap: args.sourcemap,
         preserveModules: true,
         preserveModulesRoot: rootdir,
         entryFileNames: args.format === "esm" ? "[name].mjs" : "[name].js",
      });
   } else if (args.format === "iife" || args.format === "umd") {
      outputs.push({
         dir: outdir,
         format: args.format,
         name: args.name || "Bundle",
         sourcemap: args.sourcemap,
         entryFileNames: "[name].js",
      });
   }

   for (const output of outputs) {
      await bundle.write(output);
   }

   await bundle.close();


   if (!child && rollupConfig && rollupConfig.input) {
      const mapentries = mapEntriesToOutdirs(rollupConfig.input, rootdir, outdir)
      if (mapentries.length > 1) {
         spinner.text = `📦 Bundling ${mapentries.length} entries...`;
      }

      for (const { entry } of mapentries) {
         await bundler({
            ...args,
            entry,
            outdir,
         }, spinner, true);
      }

   }

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
         format: "esm",
         preserveModules: true,
         preserveModulesRoot: args.rootdir,
         dir: path.join(args.outdir),
      });
      await bundlets.close();
   }
}

export default bundler;
