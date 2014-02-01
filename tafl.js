(function (exports) {
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

    // Immutable Cell
    // TODO private members
    Cell = (function CellClosure() {

        function Cell(ref) {
            if (!ref || ref.length !== 2) {
                throw new TypeError("Cell ref invalid - should be 2-element array: " + ref);
            }
            this.internal = {
                row: ref[0],
                col: ref[1],
                name: "R" + ref[0] + "C" + ref[1],
            };
        }

        Cell.prototype = {

            get row() { return this.internal.row; },
            set row(value) { throw new TypeError(); },

            get col() { return this.internal.col; },
            set col(value) { throw new TypeError(); },

            get name() { return this.internal.name; },
            set name(value) { throw new TypeError(); },

            toString: function Cell_toString() { return this.name; },
        };

        return Cell;
    }());

    // Immutable Move
    Move = (function MoveClosure() {

        // range from start (exclusive) to end (inclusive)
        function rangeExcInc(start, end) {
            var i, j, nums = [];

            // ranges can be up or down
            if (start < end) {
                i = start + 1;
                j = end + 1;
                do {
                    nums.push(i);
                    i += 1;
                } while (i < j);
            } else {
                i = start - 1;
                j = end - 1;
                do {
                    nums.push(i);
                    i -= 1;
                } while (i > j);
            }

            return nums;
        }

        function Move(arg) {

            if (!arg.player) { throw new TypeError("'player' not defined"); }

            this.internal = {
                player: arg.player,
                start:  new Cell(arg.from),
                end:    new Cell(arg.to),
            };
        }

        Move.prototype = {

            get player() { return this.internal.player; },
            set player(value) { throw new TypeError(); },

            get start() { return this.internal.start; },
            set start(value) { throw new TypeError(); },

            get end() { return this.internal.end; },
            set end(value) { throw new TypeError(); },

            get horizontal() { return this.start.row === this.end.row; },
            set horizontal(value) { throw new TypeError(); },

            get vertical() { return this.start.col === this.end.col; },
            set vertical(value) { throw new TypeError(); },

            get path() {
                var that = this;
                if (this.horizontal) {
                    return rangeExcInc(this.start.col, this.end.col)
                        .map(function (colIndex) {
                            return new Cell([that.start.row, colIndex]);
                        });
                }
                if (this.vertical) {
                    return rangeExcInc(this.start.row, this.end.row)
                        .map(function (rowIndex) {
                            return new Cell([rowIndex, that.start.col]);
                        });
                }
                throw new TypeError("Invalid (diagonal) move coordinates.");
            },
            set path(value) { throw new TypeError(); },

            toString: function Move_toString() {
                return "{ player: " + this.player
                    + ", start: " + this.start
                    + ", end: " + this.end
                    + "}";
            },
        };
        return Move;
    }());

    Board = (function BoardClosure() {
        function createDefaultState() {
            return [
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
        }

        function Board(arg) {
            this.internal = arg || {
                state: createDefaultState(),
                activePlayer: team.defenders, // could also be team.attackers
                moves: [],
                finished: false,
            };
        }

        Board.prototype = {

            get state() { return this.internal.state; },
            set state(value) { throw new TypeError(); },

            get sideLength() { return this.state.length; },
            set sideLength(value) { throw new TypeError(); },

            get activePlayer() { return this.internal.activePlayer; },
            set activePlayer(value) { throw new TypeError(); },

            adjacent: function Board_adjacent(cell) {
                var north   = new Cell([cell.row + 1, cell.col]),
                    south   = new Cell([cell.row - 1, cell.col]),
                    east    = new Cell([cell.row, cell.col + 1]),
                    west    = new Cell([cell.row, cell.row - 1]);

                return [north, south, east, west]
                    .filter(this.inBounds.bind(this));
            },

            inBounds: function Board_inBounds(cell) {
                return cell.row >= 0
                    && cell.row < this.sideLength
                    && cell.col >= 0
                    && cell.col < this.sideLength;
            },

            clear: function Board_clear(move, piece) {
                var that = this;
                return move.path.every(function (cell) {
                    var occupier = that.occupant(cell);
                    return occupier === types.none || (piece === types.king && occupier === types.safehouse);
                });
            },

            occupant: function Board_occupant(cell) {
                return this.state[cell.row][cell.col];
            },

            update: function Board_update(arg) {
                var move    = new Move(arg),
                    errMsg  = this.invalid(move),
                    tmp     = this.internal.state,
                    start   = move.start,
                    end     = move.end,
                    that    = this;

                if (errMsg) {
                    throw new Error("Invalid move: " + move + " - " + errMsg);
                }

                this.internal.moves.push(move);

                tmp[end.row][end.col]     = tmp[start.row][start.col];
                tmp[start.row][start.col] = types.none;

                if (this.occupant(end) === types.safehouse) {
                    this.winGame(team.defenders);
                }

                // TODO less type-switching, more DAT OO
                this.adjacent(end)
                    .filter(function (piece) {
                        if (that.activePlayer === team.attackers) {
                            return piece === types.defender || piece === types.king;
                        }
                        return piece === types.attacker;
                    })
                    .filter(function (enemy) {
                        if (that.sandwiched(enemy, end)) {
                            that.deletePiece(enemy);
                            if (enemy === types.king) {
                                that.winGame(team.attackers);
                            }
                        }
                    });

                this.internal.activePlayer = this.activePlayer === team.attackers ?  team.defenders : team.attackers;
            },

            sandwiched: function Board_sandwiched(enemy, cell) {
                throw new Error("not yet implemented.");
            },

            winGame: function Board_winGame(winner) {
                this.internal.finished = true;
                this.internal.winner = winner;
            },

            invalid: function Board_invalid(move) {
                var piece;
                if (this.finished) {
                    return "game already over";
                }
                if (move.player !== this.activePlayer) {
                    return "wrong player";
                }
                if (move.start.row >= this.sideLength
                        || move.end.row >= this.sideLength
                        || move.start.col >= this.sideLength
                        || move.end.col >= this.sideLength) {
                    return "outside board";
                }
                if (move.start.row === move.end.row
                        && move.start.col === move.end.col) {
                    return "didn't move";
                }
                piece = this.occupant(move.start);
                if (move.player === team.attackers
                        && piece !== types.attacker) {
                    return "player's piece not at start";
                }
                if (move.player === team.defenders
                        && piece !== types.defender
                        && piece !== types.king) {
                    return "player's piece not at start";
                }
                if (!move.horizontal && !move.vertical) {
                    return "not straight";
                }
                if (!this.clear(move, piece)) {
                    return "path blocked";
                }
                return false;
            },

            toString: function Board_toString() {
                var tmp     = this.state[0].map(function () { return "-"; }),
                    edge    = Array.join(tmp, '-'),
                    rows    = this.state.map(function (row) {
                        return "|" + Array.join(row, ' ') + "|";
                    });
                return edge + "-\n" + Array.join(rows, "\n") + "\n-" + edge;
            },
        };

        return Board;
    }());

    exports.TypeError  = TypeError;
    exports.Move       = Move;
    exports.Board      = Board;
    exports.team       = team;

}(this));
