#!/usr/bin/env node

import { Command } from "commander";
import serve from "./actions/serve.js";
import build from "./actions/build.js";
import create from "./actions/create.js";
const program = new Command();

program.name("Make Pack").description("Usages");

program
   .command("create")
   .description("create a new project")
   .action(create);

program
   .command("serve")
   .option("-p, --port <type>", "Port number", "3000")
   .option("-e, --entry <type>", "entry file")
   .description("Start the server")
   .action(serve);

program
   .command("build")
   .option("-e, --entry <type>", "entry file o directory (you can use glob pattern)", "src/**/*.{tsx,ts,js,jsx}")
   .option("-out, --outdir <type>", "output directory", "build")
   .description("build the project")
   .action(build);

program.parse();
