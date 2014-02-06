/*jslint browser: true */
/*global $ */
(function (exports, document, $) {
    "use strict";

    exports.typeInfo = Object.freeze({
        king: { symbol: "k", color: "#FFCCCC" },
        defender: { symbol: "d", color: "#CCCCCC" },
        attacker: { symbol: "a", color: "#DB9370" },
        safehouse: { symbol: "#", color: "#005500" },
        none: { symbol: "-", color: "#FFFFFF" },
    });

    exports.BoardView = (function BoardViewClosure() {

        function BoardView(canvasId) {
            var canvas      = document.querySelector(canvasId),
                context     = canvas.getContext("2d"),
                x0          = canvas.offsetLeft,
                y0          = canvas.offsetTop,
                cellSize    = 50,
                sideLength  = 11,
                moveStarted = false,
                listeners   = Object.create(null);

            function getRow(y) {
                var y1 = y - y0;
                return Math.floor(y1 / cellSize);
            }

            function getCol(x) {
                var x1 = x - x0;
                return Math.floor(x1 / cellSize);
            }

            function getX(col) {
                return col * cellSize;
            }

            function getY(row) {
                return row * cellSize;
            }

            function highlightCell(row, col) {
                var x = getX(col),
                    y = getY(row);
                context.strokeStyle = "#00FF00";
                context.strokeRect(x, y, cellSize, cellSize);
            }

            function fireEvent(eventName, args) {
                listeners[eventName].forEach(function (listener) {
                    listener(eventName, args);
                });
            }

            this.addEventListener = function BoardView_addEventListener(eventName, listener) {
                if (typeof listeners[eventName].push !== "function") {
                    listeners[eventName] = [];
                }
                listeners[eventName].push(listener);
            };

            this.redrawBoard = function BoardView_redrawBoard() {
                $(canvas).attr({
                    height: cellSize * sideLength,
                    width: cellSize * sideLength,
                });
            };

            this.draw = function BoardView_drawCell(type, row, col) {
                var x = getX(col),
                    y = getY(row);
                context.fillStyle = type.color;
                context.fillRect(x, y, cellSize, cellSize);
                context.strokeStyle = "#000000";
                context.strokeRect(x, y, cellSize, cellSize);
                context.fillStyle = "#802A2A";
                context.textAlign = "center";
                context.textBaseLine = "alphabetic";
                context.font = "bold " + cellSize + "px sans-serif";
                context.fillText(type.symbol, x + cellSize / 2, y + cellSize * 0.9);
            };

            Object.defineProperties(this, {
                cellSize: {
                    get: function () { return cellSize; },
                    set: function (value) { cellSize = value; this.redrawBoard(); }
                },
                sideLength: {
                    get: function () { return sideLength; },
                    set: function (value) { sideLength = value; this.redrawBoard(); }
                },
            });

            this.redrawBoard();

            canvas.addEventListener("mouseup", function (mouseEvent) {
                var x = mouseEvent.clientX - x0,
                    y = mouseEvent.clientY - y0,
                    r = getRow(y),
                    c = getCol(x);

                if (moveStarted) {
                    fireEvent("playermove", { row: r, col: c });
                }
                moveStarted = !moveStarted;

                highlightCell(r, c);
            });
        }


        return BoardView;
    }());


}(this, document, $));
