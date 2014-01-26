/*jslint node: true */
"use strict";

var tafl = require("./tafl"),
    Board = tafl.Board,
    board;

console.log(tafl);
board = new Board();

board.update({ player: "defenders", from: [3, 5], to: [2, 5] });
board.update({ player: "attackers", from: [1, 4], to: [1, 1] });
board.update({ player: "defenders", from: [5, 3], to: [2, 3] });
board.update({ player: "attackers", from: [5, 1], to: [9, 1] });

console.log(board.state);
