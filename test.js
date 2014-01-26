/*jslint node: true */
"use strict";

var tafl = require("./tafl"),
    Board = tafl.Board,
    board;

console.log(tafl);
board = new Board();

board.update({ player: "defenders", from: "D6", to: "C6" });
board.update({ player: "attackers", from: "B6", to: "B2" });
board.update({ player: "defenders", from: "F6", to: "C4" });
board.update({ player: "attackers", from: "F2", to: "J2" });

console.log(board.state);
