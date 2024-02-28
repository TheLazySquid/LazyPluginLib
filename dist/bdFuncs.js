const createCallbackHandler = (callbackName) => {
    const fullName = callbackName + "Callbacks";
    this[fullName] = [];
    this[callbackName] = () => {
        for (let i = 0; i < this[fullName].length; i++) {
            this[fullName][i].callback();
        }
    };
    return (callback, once, id) => {
        let object = { callback };
        const delCallback = () => {
            this[fullName].splice(this[fullName].indexOf(object), 1);
        };
        // if once is true delete it after use
        if (once === true) {
            object.callback = () => {
                callback();
                delCallback();
            };
        }
        if (id) {
            object.id = id;
            for (let i = 0; i < this[fullName].length; i++) {
                if (this[fullName][i].id === id) {
                    this[fullName][i] = object;
                    return delCallback;
                }
            }
        }
        this[fullName].push(object);
        return delCallback;
    };
};
/**
 * Takes a callback and fires it when the plugin is started
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
export const onStart = createCallbackHandler("start");
/**
 * Takes a callback and fires it when the plugin is stopped
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
export const onStop = createCallbackHandler("stop");
/**
 * Takes a callback and fires it when the user navigates
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
export const onSwitch = createCallbackHandler("onSwitch");
/**
 * Sets the settings panel to an HTML or React element
 * @param el - The element to be rendered in the settings panel
 */
export const setSettingsPanel = (el) => {
    this.getSettingsPanel = () => el;
};
