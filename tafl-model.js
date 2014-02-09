/*globals Publisher */
(function (exports, Publisher) {
    "use strict";

    var Cell,
        Move,
        Board,
        piece,
        types,
        team;

    team = Object.freeze({
        attackers: "Attackers",
        defenders: "Defenders",
    });

    piece = Object.freeze({

        sandwiched: function piece_sandwiched(adjacent, enemy, cell) {
            var oppositeRow,
                oppositeCol;

            if (cell.row === enemy.cell.row) {
                oppositeRow = cell.row;
                oppositeCol = (enemy.cell.col > cell.col)  ? cell.col - 1 : cell.col + 1;
            } else {
                oppositeRow = (enemy.cell.row > cell.row)  ? cell.row - 1 : cell.row + 1;
                oppositeCol = cell.col;
            }

            return adjacent
                .filter(function (data) {
                    return data.piece.team === enemy.piece.team
                        && data.cell.row === oppositeRow
                        && data.cell.col === oppositeCol;
                })
                .length === 1;
        },

        toString: function piece_toString() {
            return this.symbol;
        },
    });

    types = Object.freeze({
        attacker:   Object.create(piece, { symbol: { value: "a" }, team: { value: team.attackers } }),
        defender:   Object.create(piece, { symbol: { value: "d" }, team: { value: team.defenders } }),
        safehouse:  Object.create(piece, { symbol: { value: "#" } }),
        none:       Object.create(piece, { symbol: { value: "-" } }),
        king:       Object.create(piece, {
            symbol:     { value: "k" },
            team:       { value: team.defenders },
            sandwiched: {
                value: function kingSandwiched(adjacentPieces, enemy) {
                    var surrounding = adjacentPieces
                            .filter(function (data) {
                                return data.piece.team === enemy.piece.team;
                            });
                    return 4 === surrounding.length;
                }
            }
        }),
        lookup: function (value) {
            var prop;
            for (prop in this) {
                if (this.hasOwnProperty(prop)) {
                    if (this[prop].symbol === value) {
                        return this[prop];
                    }
                }
            }
            throw new TypeError("type not found: " + value);
        },
    });

    // Immutable Cell
    Cell = (function CellClosure() {

        function Cell(ref) {
            if (!ref || ref.length !== 2) {
                throw new TypeError("Cell ref invalid - should be 2-element array: " + ref);
            }

            this.row = ref[0];
            this.col = ref[1];
            this.name = "R" + ref[0] + "C" + ref[1];

            this.toString = function Cell_toString() {
                return this.name;
            };

            Object.freeze(this);
        }

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

            this.player = arg.player;
            this.start = new Cell(arg.from);
            this.end = new Cell(arg.to);

            this.toString = function Move_toString() {
                return "{ player: " + this.player
                    + ", start: " + this.start
                    + ", end: " + this.end
                    + "}";
            };

            Object.defineProperties(this, {
                horizontal: {
                    get: function () { return this.start.row === this.end.row; },
                    set: function (value) { throw new TypeError(); },
                },
                vertical: {
                    get: function () { return this.start.col === this.end.col; },
                    set: function (value) { throw new TypeError(); },
                },
                path: {
                    get: function () {
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
                        throw new Error("Invalid (diagonal) move coordinates.");
                    },
                    set: function (value) { throw new TypeError(); },
                },
            });

            Object.freeze(this);
        }

        return Move;
    }());

    Board = (function BoardClosure() {
        function createDefaultState() {
            return [
                ["#", "-", "-", "a", "a", "a", "a", "a", "-", "-", "#"],
                ["-", "-", "-", "-", "-", "a", "-", "-", "-", "-", "-"],
                ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
                ["a", "-", "-", "-", "-", "d", "-", "-", "-", "-", "a"],
                ["a", "-", "-", "-", "d", "d", "d", "-", "-", "-", "a"],
                ["a", "a", "-", "d", "d", "k", "d", "d", "-", "a", "a"],
                ["a", "-", "-", "-", "d", "d", "d", "-", "-", "-", "a"],
                ["a", "-", "-", "-", "-", "d", "-", "-", "-", "-", "a"],
                ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
                ["-", "-", "-", "-", "-", "a", "-", "-", "-", "-", "-"],
                ["#", "-", "-", "a", "a", "a", "a", "a", "-", "-", "#"]
            ];
        }

        function buildBoard(state) {
            return state.map(function (row) {
                return row.map(function (symbol) {
                    return types.lookup(symbol);
                });
            });
        }

        function Board(arg) {
            var internal = arg || {
                state: buildBoard(createDefaultState()),
                activePlayer: team.defenders, // could also be team.attackers
                moveHistory: [],
                finished: false,
            };

            Publisher.call(this);

            Object.defineProperties(this, {
                state: {
                    get: function () { return internal.state; },
                    set: function (value) { throw new TypeError(); }
                },
                sideLength: {
                    get: function () { return internal.state.length; },
                    set: function (value) { throw new TypeError(); }
                },
                activePlayer: {
                    get: function () { return internal.activePlayer; },
                    set: function (value) { throw new TypeError(); }
                },
                finished: {
                    get: function () { return internal.finished; },
                    set: function (value) { throw new TypeError(); }
                },
                winner: {
                    get: function () { return internal.winner; },
                    set: function (value) { throw new TypeError(); }
                },

            });

            // TODO it might be better to take a more functional approach
            // and have update return data (e.g. active player, victory status)
            this.update = function Board_update(arg) {
                var move    = new Move(arg),
                    errMsg  = this.invalid(move),
                    start   = move.start,
                    end     = move.end,
                    piece   = this.occupant(start),
                    that    = this;

                if (errMsg) {
                    throw new Error("Invalid move: " + move + " - " + errMsg);
                }

                internal.moveHistory.push(move);

                this.deletePiece(start);
                this.placePiece(end, piece);

                this.performCaptures({ cell: end, piece: piece });

                internal.activePlayer = (this.activePlayer === team.attackers) ?  team.defenders : team.attackers;

            };

            this.placePiece = function Board_placePiece(cell, piece) {
                if (this.occupant(cell) === types.safehouse) {
                    this.winGame(team.defenders);
                }
                internal.state[cell.row][cell.col] = piece;
            };

            this.deletePiece = function Board_deletePiece(cell) {
                if (this.activePlayer === team.attackers && this.occupant(cell) === types.king) {
                    this.winGame(team.attackers);
                }
                internal.state[cell.row][cell.col] = types.none;
            };

            this.winGame = function Board_winGame(winner) {
                internal.finished = true;
                internal.winner = winner;
                this.fireEvent("victory", winner);
            };
        }

        Board.prototype = {

            adjacent: function Board_adjacent(cell) {
                var that    = this,
                    north   = new Cell([cell.row + 1, cell.col]),
                    south   = new Cell([cell.row - 1, cell.col]),
                    east    = new Cell([cell.row, cell.col + 1]),
                    west    = new Cell([cell.row, cell.col - 1]);

                return [north, south, east, west]
                    .filter(this.inBounds.bind(this))
                    .map(function (cell) {
                        return {
                            cell: cell,
                            piece: that.occupant(cell)
                        };
                    });
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

            performCaptures: function Board_performCaptures(arg) {
                var that = this, capturedPieces;

                capturedPieces = this.adjacent(arg.cell)
                    .filter(function (data) {
                        return data.piece.team && data.piece.team !== that.activePlayer;
                    })
                    .filter(function (data) {
                        var surrounding = that.adjacent(data.cell);
                        return data.piece.sandwiched(surrounding, arg, data.cell);
                    });

                capturedPieces.forEach(function (data) {
                    that.deletePiece(data.cell);
                });

                return capturedPieces;
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
                if (move.player !== piece.team) {
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
                var border, axis, rowStrings;
                rowStrings = this.state.map(function (row, i) {
                    var cellStrings = row.map(function (cell) {
                        return cell.toString();
                    });
                    return "|" + cellStrings.join(" ") + "| " + i;
                });
                border = this.state[0].map(function () { return "-"; }).join("-");
                axis = this.state[0].map(function (val, j) { return j; }).join(" ");
                return axis + "\n-"
                    + border + "-\n"
                    + rowStrings.join("\n") + "\n-"
                    + border;
            },
        };

        return Board;
    }());

    exports.Move    = Move;
    exports.Board   = Board;
    exports.team    = team;

}(this, Publisher));
