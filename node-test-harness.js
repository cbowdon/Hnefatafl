/*jslint node: true */
"use strict";

var tafl = require("./tafl"),
    test = require("./test"),
    board = new tafl.Board();

test(board, tafl.team);
