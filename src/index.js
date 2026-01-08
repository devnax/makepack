#!/usr/bin/env node

import { Command } from "commander";
import start from "./actions/start/index.js";
import build from "./actions/build/index.js";
import create from "./actions/create/index.js";
import release from "./actions/release/index.js";

const program = new Command();

program.name("Makepack").description("Usages");

program
   .command("create")
   .description("Create a new project")
   .action(create);

program
   .command("start")
   .option("-p, --port <port>", "Port to run the server")
   .description("Start the server")
   .action(start);

program
   .command("build")
   .description("Build the project")
   .option("-f, --format <format>", "Output format (modern, cjs, esm, umd, iife)", "modern")
   .option("-b, --bundle <bundle>", "Bundle the project", false)
   .option("-m, --minify <minify>", "Minify the output", false)
   .option("-s, --sourcemap <sourcemap>", "Generate sourcemaps", true)
   .option("-d, --declaration <declaration>", "Generate TypeScript declaration files", true)
   .action(build);

program
   .command("release")
   .description("Release it to the npm repository")
   .action(release);

program.parse();
