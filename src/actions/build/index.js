import esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { glob } from 'glob'
import ts from 'typescript'
import { execSync, logLoader } from '../../helpers.js'
import makapeckConfig from '../../makapeck-config.js'

const build = async (args) => {

   const spinner = ora("Generating a production build for the package...").start();

   try {
      const { build } = await makapeckConfig()
      const configs = build.configs
      if (!configs || !configs.length) process.exit("Invalid configuration");
      const outdir = build.outdir

      try {
         fs.removeSync(path.join(process.cwd(), outdir));
         fs.mkdirSync(path.join(process.cwd(), outdir));
      } catch (err) { }

      for (let ebconfig of configs) {
         const files = await glob(ebconfig.entryPoints) || []
         const entryPoints = files.map(entry => path.join(process.cwd(), entry))
         esbuild.buildSync({
            ...ebconfig,
            entryPoints,
            outdir: path.join(process.cwd(), outdir, ebconfig.outdir || ''),
         });
      }

      if (build.types) {
         let tsconfig = {
            outDir: path.join(process.cwd(), outdir),
            declaration: true,
            emitDeclarationOnly: true,
            strict: true,
            allowJs: true,
            jsx: ts.JsxEmit.React,
            esModuleInterop: true,
         }
         spinner.text = "Generating TypeScript declarations..."
         const files = await glob("test/**/*.{tsx,ts,js,jsx}") || []
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
      let packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/package.json'), 'utf8'));
      const formatPackageJson = build.formatPackageJson || ((p) => p)
      packageJson = formatPackageJson(packageJson)

      fs.writeFileSync(path.join(process.cwd(), outdir, '/package.json'), JSON.stringify(packageJson, null, 2));
      fs.copyFileSync(path.join(process.cwd(), '/readme.md'), path.join(process.cwd(), outdir, `/readme.md`))
      spinner.succeed('Production build generated successfully! The package is ready for deployment.')

      if (args.publish) {
         console.log("Publishing the production build to the npm repository...")
         execSync(`npm publish`, {
            cwd: path.join(process.cwd(), outdir)
         })
      } else {
         console.log(`\nTo publish your package:`);
         console.log(`${chalk.yellow(`1. Navigate to the ${outdir} directory:`)}\n ${chalk.green(`cd ./${outdir}`)}\n${chalk.yellow(`2. Publish the buildage to npm:`)}\n${chalk.green(`npm publish`)}\nYour buildage is ready to share with the world! 🚀`);
      }
   } catch (error) {
      spinner.fail("An error occurred while generating the production build.")
      console.error(error);
   }
}

export default build