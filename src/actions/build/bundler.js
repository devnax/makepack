import { rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import path from "path";
import fs from "fs/promises";
import ts from "typescript";
import { loadRollupConfig, loadViteConfig } from "../../helpers.js";

const MAX_DIR_CONCURRENCY = 16;
const MAX_FILE_COPY_CONCURRENCY = 32;

// --------------------- Batched multi-entry collector ---------------------
async function getEntriesBatch(root) {
   const entries = {};
   const dirs = [root];

   async function worker() {
      while (dirs.length) {
         const dir = dirs.shift();
         const items = await fs.readdir(dir, { withFileTypes: true });

         for (const item of items) {
            const full = path.join(dir, item.name);
            if (item.isDirectory()) dirs.push(full);
            else if (/\.(ts|tsx|js|jsx)$/.test(item.name)) {
               const name = path.relative(root, full).replace(/\.(ts|tsx|js|jsx)$/, "");
               entries[name] = full;
            }
         }
      }
   }

   const workers = Array.from({ length: MAX_DIR_CONCURRENCY }, () => worker());
   await Promise.all(workers);

   return entries;
}

// --------------------- Batched parallel asset copy ---------------------
function isCodeFile(filename) {
   return /\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(filename);
}

function isSkippedDir(name) {
   return name === "node_modules" || name === ".git" || name === ".next";
}

async function copyAssetsBatched(rootdir, outdir) {
   const queue = [];

   async function walk(dir) {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
         const full = path.join(dir, item.name);
         const rel = path.relative(rootdir, full);
         if (rel.split(path.sep).some(p => isSkippedDir(p))) continue;

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

// --------------------- Generate .d.ts using TS Compiler API ---------------------
async function generateDeclarations(rootDir, outDir) {
   const tsFiles = [];

   async function walk(dir) {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
         const full = path.join(dir, item.name);
         if (item.isDirectory()) await walk(full);
         else if (/\.(ts|tsx)$/.test(item.name)) tsFiles.push(full);
      }
   }

   await walk(rootDir);

   if (!tsFiles.length) return;

   const options = {
      declaration: true,
      emitDeclarationOnly: true,
      outDir: outDir,
      rootDir: rootDir,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.ESNext,
      esModuleInterop: true,
      skipLibCheck: true,
   };

   const program = ts.createProgram(tsFiles, options);
   program.emit();
}

// --------------------- Main Bundler ---------------------
async function bundler(args, spinner) {
   const rootdir = args.rootdir;
   const outdir = args.outdir;

   const entries = await getEntriesBatch(rootdir);
   const isTs = Object.values(entries).some(f => f.endsWith(".ts") || f.endsWith(".tsx"));

   const viteConfig = await loadViteConfig();
   const rollupConfig = await loadRollupConfig();
   const viteRollupConfig = viteConfig?.build?.rollupOptions || {};
   Object.assign(rollupConfig || {}, viteRollupConfig);

   const config = {
      ...rollupConfig,
      input: { ...entries },
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

   // --------------------- Determine output formats ---------------------
   const outputs = [];

   if (!args.format || args.format === "both") {
      outputs.push({
         dir: outdir,
         format: "esm",
         sourcemap: args.sourcemap,
         preserveModules: true,
         preserveModulesRoot: rootdir,
         entryFileNames: "[name].mjs"
      });
      outputs.push({
         dir: outdir,
         format: "cjs",
         sourcemap: args.sourcemap,
         preserveModules: true,
         preserveModulesRoot: rootdir,
         entryFileNames: "[name].cjs"
      });
   } else if (args.format === "esm" || args.format === "cjs") {
      outputs.push({
         dir: outdir,
         format: args.format,
         sourcemap: args.sourcemap,
         preserveModules: true,
         preserveModulesRoot: rootdir,
         entryFileNames: args.format === "esm" ? "[name].mjs" : "[name].cjs"
      });
   } else if (args.format === "iife" || args.format === "umd") {
      outputs.push({
         dir: outdir,
         format: args.format,
         name: args.name || "Bundle",
         sourcemap: args.sourcemap,
         entryFileNames: "[name].js"
      });
   }

   for (const output of outputs) {
      await bundle.write(output);
   }

   await bundle.close();

   // --------------------- Copy assets ---------------------
   await copyAssetsBatched(rootdir, outdir);

   // --------------------- Generate TypeScript declarations ---------------------
   if (isTs && args.declaration) {
      spinner.text = "📄 Generating TypeScript declarations programmatically...";
      await generateDeclarations(rootdir, outdir);
   }
}

export default bundler;
