(function (exports) {
    "use strict";

    exports.Publisher = (function PublisherClosure() {

        function Event(name) {
            var listeners = [];

            this.addEventListener = function Event_addEventListener(listener) {
                listeners.push(listener);
            };

            this.fire = function Event_fire(arg) {
                listeners.forEach(function (listener) {
                    listener(arg);
                });
            };

            Object.defineProperty(this, "name", {
                get: function () { return name; },
                set: function (value) { throw new TypeError(); },
            });
        }

        function Publisher() {
            var events = {};

            this.fireEvent = function Publisher_fireEvent(eventName, arg) {
                if (!events.hasOwnProperty(eventName)) {
                    events[eventName] = new Event(eventName);
                }
                events[eventName].fire(arg);
            };

            this.addEventListener = function Publisher_addEventListener(eventName, listener) {
                if (!events.hasOwnProperty(eventName)) {
                    events[eventName] = new Event(eventName);
                }
                events[eventName].addEventListener(listener);
            };

            Object.defineProperty(this, "events", {
                get: function () { return events; },
                set: function (value) { throw new TypeError(); },
            });
        }

        return Publisher;
    }());


}(this));
