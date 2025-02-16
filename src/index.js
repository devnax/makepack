#!/usr/bin/env node

import { Command } from "commander";
import start from "./actions/start/index.js";
import build from "./actions/build/index.js";
// import create from "./actions/create/index.js";

const program = new Command();

program.name("Make build").description("Usages");

// program
//    .command("create")
//    .description("create a new project")
//    .action(create);

program
   .command("start")
   // .option("-p, --port <number>", "Port number", "5000")
   // .option("-r, --root <file>", "root file")
   .description("Start the server")
   .action(start);

program
   .command("build")
   // .option("-e, --entry <file>", "Entry file or directory (you can use a glob pattern)", "src/**/*.{tsx,ts,js,jsx}")
   // .option("-p, --publish", "Publish the project to the npm repository", false)
   .description("Build the project and optionally publish it to the npm repository")
   .action(build);
program.parse();
