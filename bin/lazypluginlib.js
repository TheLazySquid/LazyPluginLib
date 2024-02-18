#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { join, resolve } from "path";
import build from "../build.js";
import fs from "fs";
import { pathToFileURL } from "url";

yargs(hideBin(process.argv))
  .scriptName("lpl")
  .command('build', 'build the project', {
    noPluginFolder: {
      type: 'boolean',
      default: false,
      describe: 'if set, will not copy the plugin to the plugin folder'
    }
  }, async function (argv) {
    const cwd = process.cwd();
    const path = join(cwd, "lpl.config.js");
    if (!fs.existsSync(path)) {
      console.log("lpl.config.js not found");
      return;
    }

    const config = await import(pathToFileURL(path));

    // check if the config is valid
    if(!config.default) {
      console.log("lpl.config.js does not export default");
      return;
    }
    for(let required of ["input", "meta"]) {
      if(!config.default[required]) {
        console.log(`lpl.config.js does not have ${required}`);
        return;
      }
    }

    // build the plugin
    await build(
      resolve(cwd, config.default.input),
      config.default.meta,
      config.default.plugins,
      argv.noPluginFolder ? null : config.default.pluginFolder
    )
  })
  .command('init', 'create a blank lpl.config.js', {}, async function (argv) {
    const lplConfigPath = join(process.cwd(), "lpl.config.js");
    if (fs.existsSync(lplConfigPath)) {
      console.log("lpl.config.js already exists!");
      return;
    }

    fs.writeFileSync(join(process.cwd(), "lpl.config.js"), `export default {
  input: "",
  meta: {
    name: "",
    version: "",
    description: "",
    author: ""
  },
  plugins: []
}`);
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;