/**
 * Watches for an element with a given selector to be added to the DOM
 * @param selector The CSS selector to watch
 * @param callback The callback to run whenever the matching element is added to the DOM
 * @returns A function to stop watching
 */
export declare function watchElement(selector: string, callback: (element: Element) => void): () => void;
type PatchAfterCallback<ReturnValue> = (thisObject: any, args: any[], returnValue: any) => ReturnValue;
interface IPatchPathPart {
    path?: (string | number)[];
    customPath?: {
        finalProp: string;
        run: (object: any) => any | any[];
    };
    validate?: PatchAfterCallback<boolean>;
}
/**
 * Recursively patches a module, running a callback after the innermost patch is called.
 * Automatically disposes of the patch when the plugin is stopped.
 * @param module The module to patch
 * @param callback The callback to run to modify the return value of the innermost patched
 * @param path A list of lists of properties to patch, in order
 * @returns A function to dispose of the patch
 */
export declare function chainPatch(module: any, callback: PatchAfterCallback<any>, ...path: IPatchPathPart[]): () => void;
export {};
