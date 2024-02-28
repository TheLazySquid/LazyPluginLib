import type { ReactElement } from "react";
/**
 * Takes a callback and fires it when the plugin is started
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
export declare const onStart: (callback: () => void, once?: boolean, id?: string) => (() => void);
/**
 * Takes a callback and fires it when the plugin is stopped
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
export declare const onStop: (callback: () => void, once?: boolean, id?: string) => (() => void);
/**
 * Takes a callback and fires it when the user navigates
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
export declare const onSwitch: (callback: () => void, once?: boolean, id?: string) => (() => void);
/**
 * Sets the settings panel to an HTML or React element
 * @param el - The element to be rendered in the settings panel
 */
export declare const setSettingsPanel: (el: HTMLElement | ReactElement) => void;
