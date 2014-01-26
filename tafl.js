"use strict";

var Game = (function GameClosure() {
    function Game() {
        var board   = new Board(),
            moves   = [];
    }
    return Game;
}());

var Board = (function BoardClosure() {
    function Board(args) {

        var state = args.state || defaultState();
        var activePlayer = args.activePlayer || "defenders";

        get state() {
            return state;
        }

        get sideLength() {
            return state.length;
        }

    }

    function defaultState() {
        return [
            "E--aaaaa--E",
            "-----a-----",
            "-----------",
            "a----d----a",
            "a---ddd---a",
            "aa-ddkdd-aa",
            "a---ddd---a",
            "a----d----a",
            "-----------",
            "-----a-----",
            "E--aaaaa--E",
        ];
    }

    return Board;
}());

var Move = (function () {
    function Move(args) {
        get player() {
            return args.player;
        }
        get from() {
            return args.from;
        }
        get to() {
            return args.to;
        }
    }
    return Move;
}());
