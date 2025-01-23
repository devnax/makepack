import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob'
import ts from 'typescript'
import { execSync, logLoader, loadConfig } from '../../helpers.js';

const pack = async (args) => {
   args.outdir = 'pack'
   try {
      fs.removeSync(path.join(process.cwd(), args.outdir));
      fs.mkdirSync(path.join(process.cwd(), args.outdir));
   } catch (err) { }

   const files = await glob('src/**/*.{tsx,ts,js,jsx}') || []
   const entryPoints = files.map(entry => path.join(process.cwd(), entry))
   let loader = logLoader("Generating a production build for the package...")
   const config = await loadConfig(args)
   const packConfig = config.pack || {}
   const esmConfig = packConfig?.esm
   const cjsConfig = packConfig?.cjs
   const tsConfig = packConfig?.tsconfig

   async function build(format) {
      return esbuild.buildSync({
         ...(format === 'esm' ? esmConfig : cjsConfig),
         format: format,
         entryPoints,
         outdir: path.join(process.cwd(), args.outdir, format),
      });
   }

   esmConfig && await build('esm')
   cjsConfig && await build('cjs')

   loader.stop()
   if (tsConfig) {
      loader = logLoader("🔄 Generating TypeScript declarations...")
      const program = ts.createProgram(files, tsConfig);
      const emitResult = program.emit();
      const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

      if (diagnostics.length > 0) {
         diagnostics.forEach(diagnostic => {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
               const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
               console.error(`Error at ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
               console.error(`Error: ${message}`);
            }
         });
      } else {
         console.log('✅ TypeScript declaration files generated successfully!');
      }
      loader.stop()
   }

   let packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/package.json'), 'utf8'));

   let name = packageJson.name
   let version = packageJson.version
   let description = packageJson.description
   delete packageJson.name
   delete packageJson.version
   delete packageJson.description

   packageJson = {
      name,
      version,
      description,
      main: './cjs/index.js',
      module: './esm/index.js',
      types: './types/index.d.ts',
      ...packageJson,
   }

   delete packageJson.type

   fs.writeFileSync(path.join(process.cwd(), args.outdir, '/package.json'), JSON.stringify(packageJson, null, 2));

   fs.copyFileSync(path.join(process.cwd(), '/readme.md'), path.join(process.cwd(), args.outdir, `/readme.md`))
   console.log('✅ Production build generated successfully! The package is ready for deployment.');

   if (args.publish) {
      console.log("Publishing the production build to the npm repository...")
      execSync(`npm publish`, {
         cwd: path.join(process.cwd(), args.outdir)
      })
   } else {
      console.log(`To publish your package:\n1. Navigate to the ${args.outdir} directory:\ncd ./${args.outdir}\n2. Publish the package to npm:\nnpm publish\nYour package is ready to share with the world! 🚀`);
   }
}

export default pack