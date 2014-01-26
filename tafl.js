"use strict";

var Move = (function () {
    var that = {};

    function Move(arg) {
        if (!arg.player) { throw new TypeError("null player"); }
        if (!arg.from) { throw new TypeError("null from"); }
        if (!arg.to) { throw new TypeError("null to"); }

        that.player = arg.player;
        that.from = arg.from;
        that.to = arg.to;
    }

    Move.prototype = {
        get player() { return that.player; },
        set player(value) { throw new Error(); },

        get from() { return that.from; },
        set from(value) { throw new Error(); },

        get to() { return that.to; },
        set to(value) { throw new Error(); },

        get valid() {
            return false;
        },
        set valid(value) { throw new Error(); }
    };
    return Move;
}());

module.exports.Board = (function BoardClosure() {
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

    var that;

    function Board(arg) {
        that = arg || {
            state: defaultState(),
            activePlayer: "defenders",
            moves: []
        };
    }

    Board.prototype = {

        // TODO  state should be computed
        get state() { return that.state; },
        set state(value) { throw new Error(); },

        get sideLength() { return that.state.length; },
        set sideLength(value) { throw new Error(); },

        get activePlayer() { return that.activePlayer; },
        set activePlayer(value) { throw new Error(); },

        update: function (arg) {
            var move = new Move(arg);

            if (move.player !== this.activePlayer) {
                throw new Error("Wrong player");
            }
            if (!move.valid) {
                throw new Error("Invalid move");
            }
            that.moves.push(move);
        }
    };

    return Board;
}());
