(function (root) {
    "use strict";

    var Cell, Move, Board, types, team;

    types = Object.freeze({
        king: "k",
        attacker: "a",
        defender: "d",
        safehouse: "S",
        none: "-",
        lookup: function (value) {
            Object.keys(this).forEach(function (key) {
                if (this[key] === value) {
                    return key;
                }
            });
            return false;
        },
    });

    team = Object.freeze({
        attackers: "attackers",
        defenders: "defenders",
    });

    // Cell with mutable occupier
    Cell = (function CellClosure() {
        var that;

        function Cell(arg) {
            that = {
                row: arg.row,
                col: arg.col,
                name: "R" + arg.row + "C" + arg.col,
                occupier: arg.occupier || types.none,
            };
        }

        Cell.prototype = {

            get row() { return that.row; },
            set row(value) { throw new TypeError(); },

            get col() { return that.col; },
            set col(value) { throw new TypeError(); },

            get name() { return that.name; },
            set name(value) { throw new TypeError(); },

            get occupier() { return that.occupier; },
            set occupier(value) {
                if (that.occupier !== types.none) {
                    throw new Error("Cell already occupied");
                }
                that.occupier = value;
            },
        };

        return Cell;
    }());

    // Immutable Move object
    Move = (function MoveClosure() {
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
            set player(value) { throw new TypeError(); },

            get start() { return that.start; },
            set start(value) { throw new TypeError(); },

            get end() { return that.end; },
            set end(value) { throw new TypeError(); },

            get horizontal() { return that.start[0] === that.end[0]; },
            set horizontal(value) { throw new TypeError(); },

            get vertical() { return that.start[1] === that.end[1]; },
            set vertical(value) { throw new TypeError(); },

            get distance() {
                if (this.horizontal) {
                    return Math.abs(that.start[1] - that.end[1]);
                }
                if (this.vertical) {
                    return Math.abs(that.start[0] - that.end[0]);
                }
                throw new TypeError("Invalid (diagonal) move coordinates.");
            },
            set distance(value) { throw new TypeError(); },
        };
        return Move;
    }());

    Board = (function BoardClosure() {
        var that,
            defaultState;

        defaultState = [
            ["S", "-", "-", "a", "a", "a", "a", "a", "-", "-", "S"],
            ["-", "-", "-", "-", "-", "a", "-", "-", "-", "-", "-"],
            ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
            ["a", "-", "-", "-", "-", "d", "-", "-", "-", "-", "a"],
            ["a", "-", "-", "-", "d", "d", "d", "-", "-", "-", "a"],
            ["a", "a", "-", "d", "d", "k", "d", "d", "-", "a", "a"],
            ["a", "-", "-", "-", "d", "d", "d", "-", "-", "-", "a"],
            ["a", "-", "-", "-", "-", "d", "-", "-", "-", "-", "a"],
            ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
            ["-", "-", "-", "-", "-", "a", "-", "-", "-", "-", "-"],
            ["S", "-", "-", "a", "a", "a", "a", "a", "-", "-", "S"]
        ];

        function buildBoard(state) {
            var board = state.map(function (row, i) {
                row.map(function (cellValue, j) {
                    var type = types.lookup(cellValue);
                    return new Cell({ occupier: type, row: i, col: j });
                });
            });
        }

        function Board(arg) {
            that = arg || {
                state: defaultState,
                activePlayer: team.defenders, // could also be team.attackers
                moves: []
            };

            that.board = buildBoard(that.state);
        }

        Board.prototype = {

            // TODO  state should be computed
            get state() { return that.state; },
            set state(value) { throw new TypeError(); },

            get sideLength() { return that.state.length; },
            set sideLength(value) { throw new TypeError(); },

            get activePlayer() { return that.activePlayer; },
            set activePlayer(value) { throw new TypeError(); },

            clear: function (move) {
                return false;
            },

            occupant: function (cell) {
                return team.defenders;
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
                if (this.occupant(move.end) !== types.none) {
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

    root.TypeError = TypeError;
    root.Move = Move;
    root.Board = Board;
    root.team = team;

}(this));
