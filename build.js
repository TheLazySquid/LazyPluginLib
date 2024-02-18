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

let imported = new Set();

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
            let index = Infinity;
            while((index = pluginBase.lastIndexOf("//#IF", index)) !== -1) {
                let conditions = pluginBase.slice(index + 5, pluginBase.indexOf("\n", index)).trim().split(" ");
                let shouldInclude = conditions.some(cond => imported.has(cond));
                
                // remove the code 
                if(!shouldInclude) {
                    let start = index;
                    let end = pluginBase.indexOf("\n", pluginBase.indexOf("//#ENDIF", index)) + 1;
                    pluginBase = pluginBase.slice(0, start) + pluginBase.slice(end);
                } else {
                    // remove the //#IF and //#ENDIF
                    pluginBase = pluginBase.slice(0, index) + pluginBase.slice(pluginBase.indexOf("\n", index) + 1);
                    let end = pluginBase.indexOf("//#ENDIF", index);
                    pluginBase = pluginBase.slice(0, end) + pluginBase.slice(pluginBase.indexOf("\n", end) + 1);
                }
            }

            // Replace //#CODE with the plugin code
            pluginBase = pluginBase.replace("//#CODE", code);
            return metaStr + pluginBase;
        }
    }
}

function removeLplImports() {
    return {
        name: 'remove-lpl-imports',
        transform(code) {
            let ast = this.parse(code);

            let removeParts = [];

            // any imports for 'lazypluginlib' should be removed
            for(let i = 0; i < ast.body.length; i++) {
                let node = ast.body[i];
                if(node.type !== "ImportDeclaration") continue;
                if(node.source.value !== "lazypluginlib") continue;

                // In theory, we could prevent the AST from being re-parsed by doing this, but it leads to all kinds of issues
                // ast.body.splice(i, 1);
                // i--;

                removeParts.push([node.start, node.end]);
                for(let specifier of node.specifiers) {
                    imported.add(specifier.local.name);
                }
            }

            // remove the imports, going from the end to the start
            for(let i = removeParts.length - 1; i >= 0; i--) {
                code = code.slice(0, removeParts[i][0]) + code.slice(removeParts[i][1]);
            }

            return { code };
        }
    };
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
        plugins: [...rollupPlugins, functionWrap(meta), removeLplImports()]
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

    console.log("Build successful")
}