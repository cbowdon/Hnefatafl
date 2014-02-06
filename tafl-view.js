/*jslint browser: true, devel: true */
/*global $ */
(function (exports, document, $) {
    "use strict";

    exports.typeViewInfo = Object.freeze({
        king: { symbol: "k", color: "#FFCCCC" },
        defender: { symbol: "d", color: "#CCCCCC" },
        attacker: { symbol: "a", color: "#DB9370" },
        safehouse: { symbol: "#", color: "#005500" },
        none: { symbol: "-", color: "#FFFFFF" },
        lookup: function typeViewInfo_lookup(symbol) {
            var prop;
            for (prop in this) {
                if (this.hasOwnProperty(prop)) {
                    if (this[prop].symbol === symbol) {
                        return this[prop];
                    }
                }
            }
            throw new TypeError("type not found: " + symbol);
        },
    });

    exports.BoardView = (function BoardViewClosure() {

        function BoardView(canvasId, typeViewInfo) {
            var canvas      = document.querySelector(canvasId),
                context     = canvas.getContext("2d"),
                x0          = canvas.offsetLeft,
                y0          = canvas.offsetTop,
                cellSize    = 50,
                sideLength  = 11,
                moveStart   = null,
                listeners   = Object.create(null),
                highlighted = [];

            function getRow(y) {
                var y1 = y - y0;
                return 1 + Math.floor(y1 / cellSize);
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

            function cellBorder(row, col, color) {
                var x = getX(col),
                    y = getY(row);
                context.strokeStyle = color;
                context.strokeRect(x, y, cellSize, cellSize);
            }

            function highlightCell(row, col) {
                cellBorder(row, col, "#00FF00");
                highlighted.push([row, col]);
            }

            function clearHighlights() {
                highlighted.forEach(function (rc) {
                    cellBorder(rc[0], rc[1], "#000000");
                });
            }

            function fireEvent(eventName, args) {
                if (typeof listeners[eventName] === "object"
                        && typeof listeners[eventName].forEach === "function") {
                    listeners[eventName].forEach(function (listener) {
                        listener(args);
                    });
                }
            }

            this.addEventListener = function BoardView_addEventListener(eventName, listener) {
                if (typeof listeners[eventName] !== "object"
                        || typeof listeners[eventName].push !== "function") {
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

            this.draw = function BoardView_drawCell(symbol, row, col) {
                var x     = getX(col),
                    y     = getY(row),
                    type  = typeViewInfo.lookup(symbol);
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

            this.error = function BoardView_error(err) {
                alert(err.message);
            };

            this.winner = function BoardView_winner(winner) {
                alert("Winner: " + winner  + "!");
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

            canvas.addEventListener("mouseup", function mouseup_listener(mouseEvent) {

                var x = mouseEvent.clientX - x0,
                    y = mouseEvent.clientY - y0,
                    r = getRow(y),
                    c = getCol(x);
                // TODO usuability - prevent "gutter" clicks on the edge of cells
                highlightCell(r, c);

                if (moveStart && (moveStart[0] !== r || moveStart[1] !== c)) {
                    fireEvent("playermove", { from: moveStart, to: [r, c] });
                    moveStart = null;
                }
                else if (moveStart && moveStart[0] === r && moveStart[1] === c) {
                    moveStart = null;
                    clearHighlights();
                } else {
                    moveStart = [r, c];
                }

            });
        }

        return BoardView;
    }());


}(this, document, $));
