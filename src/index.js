#!/usr/bin/env node

import { Command } from "commander";
import serve from "./actions/serve.js";
import pack from "./actions/pack.js";
import create from "./actions/create/index.js";
import path from 'path'

const program = new Command();

program.name("Make Pack").description("Usages");

program
   .command("create")
   .description("create a new project")
   .action(create);

program
   .command("serve")
   .option("-p, --port <number>", "Port number", "5000")
   .option("-r, --root <file>", "root file")
   .description("Start the server")
   .action(serve);

program
   .command("pack")
   .option("-e, --entry <file>", "Entry file or directory (you can use a glob pattern)", "src/**/*.{tsx,ts,js,jsx}")
   .option("-p, --publish", "Publish the project to the npm repository", false)
   .description("Build the project and optionally publish it to the npm repository")
   .action(pack);
program.parse();
