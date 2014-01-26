"use strict";

// Immutable Move object
var Move = (function () {
    var that = {};

    function Move(arg) {
        if (!arg.player) { throw new TypeError("'player' not defined"); }
        if (!arg.from || arg.from.length !== 2) { throw new TypeError("'from' not a 2-element array"); }
        if (!arg.to || arg.to.length !== 2) { throw new TypeError("'to' not a 2-element array"); }

        that.player = arg.player;
        that.start = arg.from;
        that.end = arg.to;
    }

    Move.prototype = {
        get player() { return that.player; },
        set player(value) { throw new Error(); },

        get start() { return that.start; },
        set start(value) { throw new Error(); },

        get end() { return that.end; },
        set end(value) { throw new Error(); },

        get horizontal() { return that.start[0] === that.end[0]; },
        set horizontal(value) { throw new Error(); },

        get vertical() { return that.start[1] === that.end[1]; },
        set vertical(value) { throw new Error(); },

        get distance() {
            if (this.horizontal) {
                return Math.abs(that.start[1] - that.end[1]);
            }
            else if (this.vertical) {
                return Math.abs(that.start[0] - that.end[0]);
            }
            throw new TypeError("Invalid (diagonal) move coordinates.");
        },
        set distance(value) { throw new Error(); },
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
            activePlayer: "defenders", // could also be "attackers"
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

        clear: function (move) {
            return false;
        },

        occupant: function (cell) {
            return "defenders";
        },

        update: function (arg) {
            var move = new Move(arg),
                errMsg = this.invalid(move);

            if (errMsg) {
                throw new Error("Invalid move: " + errMsg);
            }

            that.moves.push(move);
        },

        invalid: function (move) {
            if (move.player !== this.activePlayer) {
                return "wrong player";
            }
            if (move.start[0] >= this.sideLength
                    || move.end[0] >= this.sideLength
                    || move.start[1] >= this.sideLength
                    || move.end[1] >= this.sideLength) {
                return "outside board";
            }
            if (this.occupant(move.start) !== move.player) {
                return "player's piece not at start";
            }
            if (this.occupant(move.end) !== "none") {
                return "end position olready occuppied";
            }
            if (!move.horizontal && !move.vertical) {
                return "not straight";
            }
            if (!this.clear(move)) {
                return "path blocked";
            }
            return false;
        }

    };

    return Board;
}());
