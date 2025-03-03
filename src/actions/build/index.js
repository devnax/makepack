import esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { glob } from 'glob'
import ts from 'typescript'
import makepackConfig from '../../makepack-config.js'

const build = async () => {

   const spinner = ora("Generating a production build for the package...").start();

   try {
      const { build } = await makepackConfig()
      const configs = build.configs
      if (!configs || !configs.length) process.exit("Invalid configuration");
      const outdir = path.join(process.cwd(), build.outdir)

      try {
         fs.removeSync(outdir);
         fs.mkdirSync(outdir);
      } catch (err) { }

      for (let ebconfig of configs) {
         const files = await glob(ebconfig.entryPoints) || []
         const entryPoints = files.map(entry => path.join(process.cwd(), entry))
         esbuild.buildSync({
            ...ebconfig,
            entryPoints,
            outdir: path.join(outdir, ebconfig.outdir || ''),
         });
      }

      if (build.types) {
         let tsconfig = {
            outDir: path.join(outdir, 'types'),
            declaration: true,
            emitDeclarationOnly: true,
            strict: true,
            allowJs: true,
            jsx: ts.JsxEmit.React,
            esModuleInterop: true,
         }
         spinner.text = "Generating TypeScript declarations..."
         const files = await glob("src/**/*.{tsx,ts,js,jsx}") || []
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

      fs.writeFileSync(path.join(process.cwd(), build.outdir, '/package.json'), JSON.stringify(packageJson, null, 2));
      fs.copyFileSync(path.join(process.cwd(), '/readme.md'), path.join(process.cwd(), build.outdir, `/readme.md`))
      spinner.succeed('Production build generated successfully! The package is ready for deployment.')

      console.log(`\nTo publish your package:`);
      console.log(`run: ${chalk.green(`makepack publish`)} to publish the package directly from the current project.`);
      console.log(chalk.yellow(`OR`));
      console.log(`${chalk.yellow(`Navigate to the ${build.outdir} directory:`)} ${chalk.green(`cd ./${build.outdir}`)} and run ${chalk.green(`npm publish`)}`);

   } catch (error) {
      spinner.fail("An error occurred while generating the production build.")
      console.error(error);
   }
}

export default build