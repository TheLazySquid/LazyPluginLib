# LazyPluginLib

This is my personal library for removing some of the boilerplate of making BetterDiscord plugins. It comes with a command that lets you build the project using rollup which handles all of the wrapping in a class BetterDiscord expects.

## Installation

To install, run the following:

```bash
npm i lazypluginlib@github:TheLazySquid/LazyPluginLib
```

## Usage

To use this library, manually create a lpl.config.js in your project's root or run `npx lpl init` to create one. The config file should look like this:

```js
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/index.ts", // any valid rollup input
    meta: {
        name: "Example",
        author: "TheLazySquid",
        version: "1.0.0",
        description: "An example plugin"
        // ...any other metadata (https://docs.betterdiscord.app/developers/addons/#meta)
    },
    plugins: [
        // any valid rollup plugins
        typescript()
    ],
    // if provided, will also copy the plugin to your plugins folder when it is built
    pluginFolder: "C:\\Path\\To\\Plugin\\Folder"
}
```

Running `npx lpl build` will build the plugin and place it in /build. If you provided a pluginFolder or have `process.env.PLUGIN_FOLDER` set, it will also copy the plugin to that folder. Additionally, adding `--noPluginFolder` will only build the plugin and not copy it to the plugin folder.

The major benefit (I think) of using this is that rather than having a single `start()` and `stop()` function in your plugin, you can have multiple and create more to make cleanup a breeze. Inside of a file, you can do the following:

#### onStart(callback: () => void, once?: boolean, id?: string): (() => void)
This function takes a callback and fires it when the plugin is started. It optionally takes a boolean once which, if true, will ensure the callback is only fired once. Additionally, it takes an id and will replace any other callbacks with that id. It returns a function that disposes of the callback.

#### onStop(callback: () => void, once?: boolean, id?: string): (() => void)
This function is similar to onStart, but it fires the callback when the plugin is stopped.

#### onSwitch(callback: () => void, once?: boolean, id?: string): (() => void)
This function takes a callback and fires it when the user navigates. Like the previous functions, it also returns a function that disposes of the callback.

#### watchElement(selector: string, callback: (element: HTMLElement) => void): (() => void)
This function takes a CSS selector and a callback. It calls the callback with an element whenever it is added to the DOM. It returns a function that stops watching the element. The callback will only fire when the plugin is active, and when the plugin is enabled it will fire for all elements that match the selector.

#### setSettingsPanel(element: HTMLElement | ReactElement): void
This function sets the plugin's settings panel to an HTML or React Element.

## Example Program

This example program automatically removes your profile picture when you start the plugin and adds it back when you stop it.

```js
// there really aren't any imports here. Don't question. Just enjoy.

watchElement(".avatar_f8541f", (avatar) => {
    avatar.style.display = "none";

    onStop(() => {
        avatar.style.display = "";
    }, true, "avatar");
})
```

## Typescript

If you want to use types for the built-in functions, you can import 'lazypluginlib/types.d.ts' as the top of your code. This (hopefully) should make typescript happy. This is definitiely not the best way to do it, but it works. If you have a better way, please let me know.

Additionally, I recommend using [betterdiscord-types](https://github.com/Zerthox/betterdiscord-types) by Zerthox. It provides types for BdApi and Lodash.