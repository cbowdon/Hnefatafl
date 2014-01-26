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
            var key;
            for (key in this) {
                if (this.hasOwnProperty(key) && this[key] === value) {
                    return key;
                }
            }
            throw new TypeError("Type " + value + " not found");
        },
    });

    team = Object.freeze({
        attackers: "attackers",
        defenders: "defenders",
    });

    // Cell with mutable occupant
    Cell = (function CellClosure() {
        var internal;

        function Cell(ref) {
            if (!ref || ref.length !== 2) { throw new TypeError("Cell ref invalid - should be 2-element array"); }
            internal = {
                row: ref[0],
                col: ref[1],
                name: "R" + ref.row + "C" + ref.col,
            };
        }

        Cell.prototype = {

            get row() { return internal.row; },
            set row(value) { throw new TypeError(); },

            get col() { return internal.col; },
            set col(value) { throw new TypeError(); },

            get name() { return internal.name; },
            set name(value) { throw new TypeError(); },
        };

        return Cell;
    }());

    // Immutable Move object
    Move = (function MoveClosure() {
        var internal;

        function Move(arg) {
            if (!arg.player) { throw new TypeError("'player' not defined"); }

            internal = {
                player: arg.player,
                start:  new Cell(arg.from),
                end:    new Cell(arg.to),
            };
        }

        Move.prototype = {
            get player() { return internal.player; },
            set player(value) { throw new TypeError(); },

            get start() { return internal.start; },
            set start(value) { throw new TypeError(); },

            get end() { return internal.end; },
            set end(value) { throw new TypeError(); },

            get horizontal() { return internal.start.row === internal.end.row; },
            set horizontal(value) { throw new TypeError(); },

            get vertical() { return internal.start.col === internal.end.col; },
            set vertical(value) { throw new TypeError(); },

            get distance() {
                if (this.horizontal) {
                    return Math.abs(internal.start.col - internal.end.col);
                }
                if (this.vertical) {
                    return Math.abs(internal.start.row - internal.end.row);
                }
                throw new TypeError("Invalid (diagonal) move coordinates.");
            },
            set distance(value) { throw new TypeError(); },
        };
        return Move;
    }());

    Board = (function BoardClosure() {
        var internal,
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
            return state.map(function (row, i) {
                return row.map(function (cellValue, j) {
                    return types.lookup(cellValue);
                });
            });
        }

        function Board(arg) {
            internal = arg || {
                state: defaultState,
                activePlayer: team.defenders, // could also be team.attackers
                moves: []
            };

            internal.board = buildBoard(internal.state);
        }

        Board.prototype = {

            // TODO  state should be computed
            get state() { return internal.state; },
            set state(value) { throw new TypeError(); },

            get sideLength() { return internal.state.length; },
            set sideLength(value) { throw new TypeError(); },

            get activePlayer() { return internal.activePlayer; },
            set activePlayer(value) { throw new TypeError(); },

            clear: function (move) {
                throw new Error("not yet implemented");
            },

            occupant: function (cell) {
                return internal.board[cell.row][cell.col].occupant;
            },

            update: function (arg) {
                var move = new Move(arg),
                    errMsg = this.invalid(move);

                if (errMsg) {
                    throw new Error("Invalid move: " + errMsg);
                }

                internal.moves.push(move);
            },

            invalid: function (move) {
                if (move.player !== this.activePlayer) {
                    return "wrong player";
                }
                if (move.start.row >= this.sideLength
                        || move.end.row >= this.sideLength
                        || move.start.col >= this.sideLength
                        || move.end.col >= this.sideLength) {
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
