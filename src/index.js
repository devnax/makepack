#!/usr/bin/env node

import { Command } from "commander";
import start from "./actions/start/index.js";
import build from "./actions/build/index.js";
import create from "./actions/create/index.js";
import publish from "./actions/publish/index.js";

const program = new Command();

program.name("Makepack").description("Usages");

program
   .command("create")
   .description("create a new project")
   .action(create);

program
   .command("start")
   .description("Start the server")
   .action(start);

program
   .command("build")
   .description("Build the project")
   .action(build);

program
   .command("publish")
   .description("Publish it to the npm repository")
   .action(publish);

program.parse();
