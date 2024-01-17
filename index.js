import { rollup } from "rollup";
import { join } from "path";
import fs from 'fs';
import { fileURLToPath } from "url";
import "dotenv/config"

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

function importTypesDecl() {
    return {
        name: "importTypesDecl",
        resolveId ( source ) {
            if ( source !== 'lazypluginlib/types.d.ts' ) return null;
            return source;
        },
        load ( id ) {
            if ( id !== 'lazypluginlib/types.d.ts' ) return null;
            return ``;
        }
    }
}

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
    const pluginBase = fs.readFileSync(basePluginPath, "utf-8");
    
    return {
        name: 'metaPrefixer',
        renderChunk(code) {
            return metaStr + pluginBase.replace(/\/\/#CODE/, code);
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
export default async function build(filePath, meta, rollupPlugins = [], pluginFolder) {
    // if null is passed, it will be ignored
    if (pluginFolder !== null) {
        pluginFolder = pluginFolder || process.env.PLUGIN_FOLDER;
    }
    
    const bundle = await rollup({
        input: filePath,
        plugins: [...rollupPlugins, functionWrap(meta), importTypesDecl()]
    });

    bundle.write({
        file: `./build/${meta.name}.plugin.js`,
        format: "cjs"
    })

    if(pluginFolder) {
        bundle.write({
            file: join(pluginFolder, `${meta.name}.plugin.js`),
            format: "cjs"
        })
    }
}