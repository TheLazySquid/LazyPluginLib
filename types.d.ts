type callbackHandler = (callback: () => void, once?: boolean, id?: string) => (() => void)

/**
 * Takes a callback and fires it when the plugin is started
 * @returns A function that disposes of the callback
 * */
declare const onStart: callbackHandler
/**
 * Takes a callback and fires it when the plugin is stopped
 * @returns A function that disposes of the callback
 * */
declare const onStop: callbackHandler
/**
 * Takes a callback and fires it when the user navigates
 * @returns A function that disposes of the callback
 * */
declare const onSwitch: callbackHandler
/**
 * Calls a callback with an element whenever it is added to the DOM
 * @returns A function that stops watching the element
 * */
declare const watchElement: (selector: string, callback: (element: HTMLElement) => void) => (() => void)

/** Sets the settings panel to an element */
declare const setSettingsPanel: (element: HTMLElement | import('react').ReactElement) => void