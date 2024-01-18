module.exports = class {
    constructor() {
        const createCallbackHandler = (callbackName) => {
            const fullName = callbackName + "Callbacks";
            this[fullName] = [];
            return (callback, once, id) => {
                let object = { callback }

                const delCallback = () => {
                    this[fullName].splice(this[fullName].indexOf(object), 1);
                }
                
                // if once is true delete it after use
                if (once === true) {
                    object.callback = () => {
                        callback();
                        delCallback();
                    }
                }

                if(id) {
                    object.id = id

                    for(let i = 0; i < this[fullName].length; i++) {
                        if(this[fullName][i].id === id) {
                            this[fullName][i] = object;
                            return delCallback;
                        }
                    }
                }

                this[fullName].push(object);
                return delCallback;
            }
        }
        
        const onStart = createCallbackHandler("start");
        const onStop = createCallbackHandler("stop");
        const onSwitch = createCallbackHandler("onSwitch");

        const watchElement = (selector, callback) => {
            let observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        for (let node of mutation.addedNodes) {
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

                for(let element of document.querySelectorAll(selector)) {
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
            }
        }

        const setSettingsPanel = (el) => {
            this.getSettingsPanel = () => el;
        }
//#CODE
    }


    start() {
        for(let callback of this.startCallbacks) {
            callback.callback();
        }
    }
    
    stop() {
        for(let callback of this.stopCallbacks) {
            callback.callback();
        }
    }

    onSwitch() {
        for(let callback of this.onSwitchCallbacks) {
            callback.callback();
        }
    }
}