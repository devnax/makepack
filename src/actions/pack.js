import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob'
import ts from 'typescript'
import { execSync, logLoader } from '../helpers';

const pack = async (args) => {
   args.outdir = 'pack'
   try {
      fs.removeSync(path.join(process.cwd(), args.outdir));
   } catch (err) { }

   const files = await glob('src/**/*.{tsx,ts,js,jsx}') || []
   const entries = files.map(entry => path.join(process.cwd(), entry))
   let loader = logLoader("Generating a production build for the package...")

   esbuild.buildSync({
      entryPoints: entries,
      outdir: path.join(process.cwd(), args.outdir),
      minify: true,
      sourcemap: true,
      format: "esm",
      platform: 'node',
      loader: { '.ts': 'ts' },
      //       tsconfig: path.join(process.cwd(), 'tsconfig.json'),
      //       tsconfigRaw: `{
      //   "compilerOptions": {
      //     "declaration": true,
      //     "emitDeclarationOnly": true,
      //     "jsx": "react",
      //     "module": "esnext",
      //   }
      // }`
   })
   loader.stop()
   loader = logLoader("🔄 Generating TypeScript declarations...")
   const options = {
      declaration: true,
      emitDeclarationOnly: true,
      outDir: path.join(process.cwd(), args.outdir),
      strict: true,
      allowJs: true,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
   };

   const program = ts.createProgram(files, options);
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

   fs.copyFileSync(path.join(process.cwd(), '/package.json'), path.join(process.cwd(), args.outdir, `/package.json`))
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