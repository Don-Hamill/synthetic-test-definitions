#!/usr/bin/env node
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
    .scriptName("stdx")                 // Synthetic Test Developer eXperience
    .command(require("./commands/init"))
    .command(require("./commands/run"))
    .command(require("./commands/report"))
    .demandCommand()
    .help()
    .argv;
