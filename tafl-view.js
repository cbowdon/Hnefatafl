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
                sideLength  = 11;

            function getRow(y) {
                throw new Error("not yet impl");
            }

            function getCol(x) {
                throw new Error("not yet impl");
            }

            canvas.addEventListener("mouseup", function (mouseEvent) {
                var x = mouseEvent.clientX - x0,
                    y = mouseEvent.clientY - y0;


                throw new Error("not yet impl");

            });

            this.redrawBoard = function BoardView_redrawBoard() {
                $(canvas).attr({
                    height: cellSize * sideLength,
                    width: cellSize * sideLength,
                });
            };

            this.highlightCell = function Board_highlightCell(row, col) {
                var x = col * cellSize,
                    y = row * cellSize;
                context.strokeStyle = "#00FF00";
                context.strokeRect(x, y, cellSize, cellSize);
            };

            this.draw = function BoardView_drawCell(type, row, col) {
                var x = col * cellSize,
                    y = row * cellSize;
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
        }


        return BoardView;
    }());


}(this, document, $));
