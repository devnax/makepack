import fs from 'fs-extra'
import path from 'path'
import ora from 'ora'
import { concolor, logger } from '../../helpers.js'
import bundler from './bundler.js'

const build = async (args) => {
   /* args 
   --format=both 
   --bundle=true, 
   --minify=false, 
   --sourcemap=true, 
   --declaration=true,
   */

   let printBool = (f) => typeof args[f] === 'string' ? (args[f] === 'true') : args[f];

   const outdir = path.join(process.cwd(), '.mpack');
   const rootdir = path.join(process.cwd(), 'src');

   let entry = '';
   let entryts = path.join(rootdir, 'index.ts');
   let entryjs = path.join(rootdir, 'index.js');
   let entrytsx = path.join(rootdir, 'index.tsx');
   let entryjsx = path.join(rootdir, 'index.jsx');

   if (fs.existsSync(entryts)) {
      entry = "index.ts";
   } else if (fs.existsSync(entryjs)) {
      entry = "index.js";
   } else if (fs.existsSync(entrytsx)) {
      entry = "index.tsx";
   } else if (fs.existsSync(entryjsx)) {
      entry = "index.jsx";
   } else {
      throw new Error("No entry file found in src directory. Please provide an index.ts or index.js file.");
   }

   args = {
      format: args.format || "both",
      bundle: printBool('bundle'),
      minify: printBool('minify'),
      sourcemap: printBool('sourcemap'),
      declaration: printBool('declaration'),
      outdir,
      rootdir,
      entry: path.join(rootdir, entry),
   }

   if (fs.existsSync(outdir)) {
      fs.rmSync(outdir, { recursive: true, force: true });
   }
   fs.mkdirSync(outdir)
   const spinner = ora("✨ Bundling your package..\n").start();
   await bundler(args, spinner);
   spinner.text = "Copying package.json and readme.md files..."
   const pkgPath = path.join(process.cwd(), 'package.json');
   if (fs.existsSync(pkgPath)) {
      const pkgjson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      delete pkgjson.scripts
      delete pkgjson.type
      fs.writeFileSync(path.join(outdir, 'package.json'), JSON.stringify(pkgjson, null, 2));
   } else {
      logger.error("package.json not found!");
      return;
   }

   fs.copyFileSync(path.join(process.cwd(), '/readme.md'), path.join(outdir, `/readme.md`))
   spinner.succeed(concolor.bold(concolor.green(`Build successfully completed\n`)));
   console.log(concolor.bold(`To publish your package to npm run:`));
   console.log(`${concolor.yellow(`\`npm run release\``)} Or navigate to \`.mpack\` and run: ${concolor.yellow(`\`npm publish\`\n`)}`);
   spinner.stop();
}

export default build