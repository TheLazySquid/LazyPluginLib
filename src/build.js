import { rollup, watch as rollupWatch } from "rollup";
import { join } from "path";
import fs from 'fs';
import { fileURLToPath } from "url";
import "dotenv/config"

import resolve from "@rollup/plugin-node-resolve";

/**
 * @typedef {Object} Meta
 * @property {string} name
 * @property {string} version
 * @property {string} description
 * @property {string} author
 * @property {string | undefined} invite
 * @property {string | number | undefined} authorId
 * @property {string | undefined} authorLink
 * @property {string | undefined} donate
 * @property {string | undefined} patreon
 * @property {string | undefined} website
 * @property {string | undefined} source
 */

/**
 * @private
 * @param {Meta} meta 
 */
function functionWrap(meta) {
    for(let required of ["name", "version", "description", "author"]) {
        if(!meta[required]) throw new Error(`Meta.${required} is required`);
    }

    let metaStr = `/**\n`
    for(const key in meta) {
        if(meta[key]) {
            metaStr += ` * @${key} ${meta[key]}\n`
        }
    }
    metaStr += ` */\n`
    const basePluginPath = join(fileURLToPath(import.meta.url), "..", "pluginBase.js");
    let pluginBase = fs.readFileSync(basePluginPath, "utf-8");
    
    return {
        name: 'functionWrap',
        renderChunk(code) {
            // Replace //#CODE with the plugin code
            pluginBase = pluginBase.replace("//#CODE", code);
            return metaStr + pluginBase;
        }
    }
}

/**
 * Builds the plugin
 * @param {string} filePath the file to build
 * @param {Meta} meta the meta information
 * @param {Array<import("rollup").Plugin> | undefined} rollupPlugins the plugins for rollup to use
 * @param {string | undefined} pluginFolder if provided, will also insert the plugin into the plugin folder
 */
export async function build(filePath, meta, rollupPlugins = [], pluginFolder) {
    // if null is passed, it will be ignored
    if (pluginFolder !== null) {
        pluginFolder = pluginFolder || process.env.PLUGIN_FOLDER;
    }
    
    const bundle = await rollup({
        input: filePath,
        plugins: [...rollupPlugins, functionWrap(meta), resolve()],
        context: "this" // hacky way to allow top-level this
    });

    bundle.write({
        file: './' + join('build', `${meta.name}.plugin.js`),
        format: "cjs"
    })

    if(pluginFolder) {
        bundle.write({
            file: join(pluginFolder, `${meta.name}.plugin.js`),
            format: "cjs"
        })
    }

    console.log(`Successfully built ${meta.name}.plugin.js`);
}

export async function watch(filePath, meta, rollupPlugins = [], pluginFolder) {
    // if null is passed, it will be ignored
    if (pluginFolder !== null) {
        pluginFolder = pluginFolder || process.env.PLUGIN_FOLDER;
    }
    
    const watcher = rollupWatch({
        input: filePath,
        plugins: [...rollupPlugins, functionWrap(meta), resolve()],
        context: "this", // hacky way to allow top-level this
        output: [
            {
                file: './' + join('build', `${meta.name}.plugin.js`),
                format: "cjs"
            },
            {
                file: join(pluginFolder, `${meta.name}.plugin.js`),
                format: "cjs"
            }
        ]
    });

    watcher.on('event', event => {
        if(event.code === "END") {
            console.log(`Successfully built ${meta.name}.plugin.js`);
        }
        if(event.result) event.result.close()
    });
}