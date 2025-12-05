import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { concolor, logger } from '../../helpers.js';
import bundler from './bundler.js';

const build = async (args) => {
   /*
     args options:
     --format=both
     --bundle=true
     --minify=false
     --sourcemap=true
     --declaration=true
   */

   // Convert string "true"/"false" to boolean
   const beBool = (f) =>
      typeof args[f] === 'string' ? args[f].toLowerCase() === 'true' : !!args[f];

   const outdir = path.join(process.cwd(), '.mpack');
   const rootdir = path.join(process.cwd(), 'src');

   args = {
      format: args.format || 'both',
      bundle: beBool('bundle'),
      minify: beBool('minify'),
      sourcemap: beBool('sourcemap'),
      declaration: beBool('declaration'),
      outdir,
      rootdir,
   };

   const spinner = ora('✨ Building your package...\n').start();

   try {
      // Remove old build folder
      await fs.remove(outdir);
      await fs.mkdirp(outdir);

      // Run bundler
      await bundler(args, spinner);

      spinner.text = '📦 Copying package.json and readme.md files...';

      // Copy package.json
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(pkgPath)) {
         const pkgjson = await fs.readJson(pkgPath);
         delete pkgjson.scripts;
         delete pkgjson.type;
         await fs.writeJson(path.join(outdir, 'package.json'), pkgjson, { spaces: 2 });
      } else {
         spinner.fail(concolor.red('package.json not found!'));
         return;
      }

      // Copy readme.md if exists
      const readmePath = path.join(process.cwd(), 'readme.md');
      if (await fs.pathExists(readmePath)) {
         await fs.copy(readmePath, path.join(outdir, 'readme.md'));
      }

      spinner.succeed(concolor.bold(concolor.green('Build successfully completed!\n')));
      console.log(concolor.bold('To publish your package, run:'));
      console.log(
         `${concolor.yellow('`npm run release`')} or navigate to \`.mpack\` and run: ${concolor.yellow(
            '`npm publish`\n'
         )}`
      );
   } catch (err) {
      spinner.fail(concolor.red('Build failed!'));
      logger.error(err);
   } finally {
      spinner.stop();
   }
};

export default build;
