import esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'
import ts from 'typescript'
import { execSync, logLoader, loadConfig } from '../../helpers.js'

const build = async (args) => {

   const config = await loadConfig()
   const buildConfig = config.build
   if (!buildConfig || !buildConfig.outdir) process.exit("Invalid configuration")
   const esmConfig = buildConfig?.esm
   const cjsConfig = buildConfig?.cjs
   const tsConfig = buildConfig?.tsconfig
   const outdir = buildConfig.outdir

   try {
      fs.removeSync(path.join(process.cwd(), outdir));
      fs.mkdirSync(path.join(process.cwd(), outdir));
   } catch (err) { }

   const files = await glob('test/**/*.{tsx,ts,js,jsx}') || []
   const entryPoints = files.map(entry => path.join(process.cwd(), entry))
   let loader = logLoader("Generating a production build for the buildage...")

   async function build(format) {
      let conf = format === 'esm' ? esmConfig : cjsConfig
      return esbuild.buildSync({
         ...conf,
         format: format,
         entryPoints,
         outdir: path.join(process.cwd(), outdir, format === "esm" ? '' : 'cjs')
      });
   }

   esmConfig && await build('esm')
   cjsConfig && await build('cjs')

   loader.stop()
   if (tsConfig) {
      let conf = {
         ...tsConfig,
         outDir: path.join(process.cwd(), outdir)
      }
      loader = logLoader("🔄 Generating TypeScript declarations...")
      const program = ts.createProgram(files, conf);
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

   let buildageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/buildage.json'), 'utf8'));

   let name = buildageJson.name
   let version = buildageJson.version
   let description = buildageJson.description
   delete buildageJson.name
   delete buildageJson.version
   delete buildageJson.description

   buildageJson = {
      name,
      version,
      description,
      main: './cjs/index.js',
      module: './index.js',
      types: './index.d.ts',
      files: [
         outdir
      ],
      exports: {
         ".": {
            "types": "./index.d.ts",
            "import": "./index.js",
            "require": "./cjs/index.js"
         },
         "./*": {
            "import": "./*.js",
            "require": "./cjs/*.js"
         }
      },
      ...buildageJson,
   }

   delete buildageJson.type

   fs.writeFileSync(path.join(process.cwd(), outdir, '/buildage.json'), JSON.stringify(buildageJson, null, 2));

   fs.copyFileSync(path.join(process.cwd(), '/readme.md'), path.join(process.cwd(), outdir, `/readme.md`))
   console.log('✅ Production build generated successfully! The buildage is ready for deployment.');

   if (args.publish) {
      console.log("Publishing the production build to the npm repository...")
      execSync(`npm publish`, {
         cwd: path.join(process.cwd(), outdir)
      })
   } else {
      console.log(`To publish your buildage:\n1. Navigate to the ${outdir} directory:\ncd ./${outdir}\n2. Publish the buildage to npm:\nnpm publish\nYour buildage is ready to share with the world! 🚀`);
   }
}

export default build