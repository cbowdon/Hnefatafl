(function (exports) {
    "use strict";

    exports.Publisher = (function PublisherClosure() {

        function Publisher() {
            var listeners = Object.create(null);

            this.fireEvent = function Publisher_fireEvent(eventName, args) {
                if (typeof listeners[eventName] === "object"
                        && typeof listeners[eventName].forEach === "function") {
                    listeners[eventName].forEach(function (listener) {
                        listener(args);
                    });
                }
            };

            this.addEventListener = function Publisher_addEventListener(eventName, listener) {
                if (typeof listeners[eventName] !== "object"
                        || typeof listeners[eventName].push !== "function") {
                    listeners[eventName] = [];
                }
                listeners[eventName].push(listener);
            };

        }

        return Publisher;
    }());


}(this));
