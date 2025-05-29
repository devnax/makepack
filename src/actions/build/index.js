import esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { glob } from 'glob'
import ts from 'typescript'

const eBuild = async (conf) => {

   await esbuild.build({
      jsx: 'automatic',
      ...conf,
      // outExtension: { '.js': ebconfig.format === 'esm' ? '.mjs' : '.cjs' },
      loader: {
         '.ts': 'ts',
         '.tsx': 'tsx'
      },
      outdir: path.join(process.cwd(), '.mpack', conf.format === 'esm' ? '' : conf.format),
   })
}

const build = async (args) => {
   /* args 
   --format=default 
   --bundle=true, 
   --minify=false, 
   --sourcemap=true, 
   --platform=node, 
   --target=es2020, 
   */


   let printBool = (f) => typeof args[f] === 'string' ? (args[f] === 'true') : args[f];

   args = {
      format: args.format || "default",
      bundle: printBool('bundle'),
      minify: printBool('minify'),
      sourcemap: printBool('sourcemap'),
      platform: args.platform || "",
      target: args.target || "es2020",
      declaration: printBool('declaration'),
   }

   const outdir = path.join(process.cwd(), '.mpack');
   if (fs.existsSync(outdir)) {
      fs.rmSync(outdir, { recursive: true, force: true });
   }
   fs.mkdirSync(outdir)

   const spinner = ora("Generating a production build for the package...").start();
   const files = await glob("src/**/*.{tsx,ts,js,jsx}") || [];
   const entryPoints = files.map(entry => path.join(process.cwd(), entry));
   let batchSize = args.format === 'default' ? 300 : 500;

   let ebconfig = {
      bundle: args.bundle,
      minify: args.minify,
      sourcemap: args.sourcemap,
      platform: args.platform,
      target: args.target,
   }

   for (let i = 0; i < entryPoints.length; i += batchSize) {
      const batch = entryPoints.slice(i, i + batchSize);
      let config = {
         ...ebconfig,
         entryPoints: batch,
      }
      if (args.format === 'default') {
         await eBuild({ ...config, format: "esm" });
         spinner.succeed('ESM build generated successfully!');
         await eBuild({ ...config, format: "cjs" });
         spinner.succeed('CJS build generated successfully!');
      } else {
         await eBuild({ ...config, format: args.format });
         spinner.succeed(`${args.format} build generated successfully!`);
      }
   }


   if (args.declaration) {
      const tsconfigPath = path.resolve(process.cwd(), "tsconfig.json");
      let tsconfig = {};
      if (fs.existsSync(tsconfigPath)) {
         const parsedConfig = ts.getParsedCommandLineOfConfigFile(
            tsconfigPath,
            {},
            ts.sys
         );

         if (!parsedConfig) {
            console.error("❌ Error parsing tsconfig.json");
            process.exit(1);
         } else {
            tsconfig = parsedConfig.options;
         }
      }

      tsconfig = {
         allowJs: true,
         target: ts.ScriptTarget.ESNext, // Ensure it's an enum
         skipLibCheck: true,
         moduleResolution: ts.ModuleResolutionKind.Node10,
         ...tsconfig, // Preserve root tsconfig settings
         outDir: outdir,
         declaration: true,
         emitDeclarationOnly: true,
         noEmit: false,
      };

      spinner.text = "Generating TypeScript declarations..."
      const program = ts.createProgram(files, tsconfig);
      const emitResult = program.emit();
      const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

      if (diagnostics.length > 0) {
         diagnostics.forEach(diagnostic => {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
               const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
               spinner.fail(`Error at ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
               spinner.fail(`Error: ${message}`);
            }
         });
      } else {
         spinner.succeed("TypeScript declaration files generated successfully!")
      }
   }
   spinner.text = "Copying package.json and readme.md files..."

   // update package.json to include the .mpack directory
   const pkgPath = path.join(process.cwd(), 'package.json');
   if (fs.existsSync(pkgPath)) {
      const pkgjson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (args.format === 'default') {
         pkgjson.main = "./index.cjs";
         pkgjson.module = "./index.mjs";
         pkgjson.types = './index.d.ts'
      } else {
         let t = args.format === 'mjs' ? 'module' : 'main';
         pkgjson[t] = `./index.${args.format}`;
      }

      if (args.declaration) {
         pkgjson.types = `./index.d.ts`;
      }

      delete pkgjson.scripts
      delete pkgjson.type

      fs.writeFileSync(path.join(outdir, 'package.json'), JSON.stringify(pkgjson, null, 2));
   } else {
      spinner.fail("package.json not found!");
      return;
   }

   fs.copyFileSync(path.join(process.cwd(), '/readme.md'), path.join(outdir, `/readme.md`))
   spinner.succeed("package.json and readme.md files copied successfully!")
   console.log(chalk.green(`\nBuild completed successfully!`));
   console.log(`\nTo publish your package to npm:`);
   console.log(`${chalk.green(`npm run release`)} or navigate to the ${chalk.green(`.mpack`)} directory and run ${chalk.green(`npm publish`)}`);
}

export default build