import { onStart, onStop } from './bdFuncs';
/**
 * Watches for an element with a given selector to be added to the DOM
 * @param selector The CSS selector to watch
 * @param callback The callback to run whenever the matching element is added to the DOM
 * @returns A function to stop watching
 */
export function watchElement(selector, callback) {
    let observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                for (let node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement))
                        continue;
                    if (node.matches && node.matches(selector)) {
                        callback(node);
                    }
                    if (node.querySelectorAll) {
                        for (let element of node.querySelectorAll(selector)) {
                            callback(element);
                        }
                    }
                }
            }
        }
    });
    let startDispose = onStart(() => {
        observer.observe(document.body, { childList: true, subtree: true });
        for (let element of document.querySelectorAll(selector)) {
            callback(element);
        }
    });
    let stopDispose = onStop(() => {
        observer.disconnect();
    });
    return () => {
        observer.disconnect();
        startDispose();
        stopDispose();
    };
}
/**
 * Recursively patches a module, running a callback after the innermost patch is called.
 * Automatically disposes of the patch when the plugin is stopped.
 * @param module The module to patch
 * @param callback The callback to run to modify the return value of the innermost patched
 * @param path A list of lists of properties to patch, in order
 * @returns A function to dispose of the patch
 */
export function chainPatch(module, callback, ...path) {
    let patchedFns = [];
    let disposeFns = [];
    patch(module, 0);
    function patch(object, depth) {
        // the variable names here are a mess
        let pathPart = path[depth];
        let toPatchArray = [];
        let patchProp;
        if (pathPart.path) {
            patchProp = pathPart.path[pathPart.path.length - 1];
            let toPatch = object;
            for (let i = 0; i < pathPart.path.length - 1; i++) {
                let prop = pathPart.path[i];
                toPatch = toPatch[prop];
            }
            toPatchArray.push(toPatch);
        }
        else if (pathPart.customPath) {
            patchProp = pathPart.customPath.finalProp;
            let customPath = pathPart.customPath.run(object);
            if (Array.isArray(customPath)) {
                toPatchArray.push(...customPath);
            }
            else {
                toPatchArray.push(customPath);
            }
        }
        if (toPatchArray.length === 0)
            return;
        // patch the function
        if (!patchedFns[depth]) {
            let nativeFn = toPatchArray[0][patchProp];
            patchedFns[depth] = function (...args) {
                let returnVal = nativeFn.call(this, ...args);
                if (pathPart.validate && !pathPart.validate(this, args, returnVal)) {
                    return returnVal;
                }
                if (path.length > depth + 1) {
                    patch(returnVal, depth + 1);
                }
                else {
                    callback(this, args, returnVal);
                }
                return returnVal;
            };
            // add a dispose function
            disposeFns[depth] = () => {
                for (let item of toPatchArray) {
                    item[patchProp] = nativeFn;
                }
            };
        }
        // apply patches
        for (let item of toPatchArray) {
            item[patchProp] = patchedFns[depth];
        }
    }
    const dispose = () => {
        for (let dispose of disposeFns) {
            dispose();
        }
    };
    onStop(dispose);
    return dispose;
}
