/*jslint node: true */
"use strict";

var tafl = require("./tafl"),
    test = require("./test").test,
    board = new tafl.Board();

test.run(board, tafl.team);
