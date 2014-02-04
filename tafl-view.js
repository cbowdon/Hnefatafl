/*jslint browser: true */
/*global $ */
(function (exports, document, $) {
    "use strict";

    exports.typeInfo = Object.freeze({
        king: { symbol: "k", color: "#FFCCCC" },
        defender: { symbol: "d", color: "#CCCCCC" },
        attacker: { symbol: "a", color: "#880000" },
        safehouse: { symbol: "#", color: "#005500" },
        none: { symbol: "-", color: "#FFFFFF" },
    });

    exports.BoardView = (function BoardViewClosure() {

        function BoardView(canvasId) {
            var canvas      = document.querySelector(canvasId),
                context     = canvas.getContext("2d"),
                cellSize    = 50,
                sideLength  = 11;

            this.redrawBoard = function BoardView_redrawBoard() {
                $(canvas).attr({
                    height: cellSize * sideLength,
                    width: cellSize * sideLength,
                });
            };

            this.draw = function BoardView_drawCell(type, row, col) {
                var x = col * cellSize,
                    y = row * cellSize;
                context.fillStyle = type.color;
                context.fillRect(x, y, cellSize, cellSize);
                context.fillStyle = "brown";
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
