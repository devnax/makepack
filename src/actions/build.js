import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob'
import ts from 'typescript'

const pack = async (args) => {
   try {
      fs.removeSync(path.join(process.cwd(), args.outdir));
   } catch (err) { }

   const files = await glob('src/**/*.{tsx,ts,js,jsx}') || []
   const entries = files.map(entry => path.join(process.cwd(), entry))

   esbuild.build({
      entryPoints: entries,
      outdir: path.join(process.cwd(), args.outdir),
      minify: true,
      sourcemap: true,
      format: "esm",
      platform: 'node',
      loader: { '.ts': 'ts' },
      tsconfig: path.join(process.cwd(), 'tsconfig.json'),
   }).then(() => {
      console.log('Build completed successfully!');
   }).catch((err) => {
      console.error('Build failed:', err);
   });

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
      console.log('Type declarations generated successfully!');
   }
}

export default pack