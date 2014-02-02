(function (exports) {
    "use strict";

    var Cell,
        Move,
        Board,
        piece,
        types,
        team;

    team = Object.freeze({
        attackers: "attackers",
        defenders: "defenders",
    });

    piece = Object.freeze({

        sandwiched: function piece_sandwiched(adjacentPieces, enemy, cell) {
            var oppositeRow,
                oppositeCol;

            if (cell.row === enemy.cell.row) {
                oppositeRow = cell.row;
                oppositeCol = (enemy.cell.col > cell.col)  ? cell.col + 2 : cell.col - 2;
            } else {
                oppositeRow = (enemy.cell.row > cell.row)  ? cell.row + 2 : cell.row - 2;
                oppositeCol = cell.col;
            }

            return adjacentPieces
                .filter(function (piece) {
                    return piece.team === enemy.team;
                })
                .reduce(function (isOpposite, enemy) {
                    return enemy.cell.row === oppositeRow
                        && enemy.cell.col === oppositeCol;
                });
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
                            .filter(function (piece) {
                                return piece.team === enemy.team;
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
            return state.map(function (row, i) {
                return row.map(function (symbol, j) {
                    return types.lookup(symbol);
                });
            });
        }

        function Board(arg) {
            this.internal = arg || {
                state: buildBoard(createDefaultState()),
                activePlayer: team.defenders, // could also be team.attackers
                moveHistory: [],
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
                    start   = move.start,
                    end     = move.end,
                    piece   = this.occupant(start),
                    that    = this;

                if (errMsg) {
                    throw new Error("Invalid move: " + move + " - " + errMsg);
                }

                this.internal.moveHistory.push(move);

                this.deletePiece(start);
                if (piece === types.king && this.occupant(end) === types.safehouse) {
                    this.winGame(team.defenders);
                }
                this.placePiece(end, piece);

                // TODO less type-switching, more DAT OO
                this.adjacent(end)
                    .filter(function (cell) {
                        var piece = that.occupant(cell);
                        if (that.activePlayer === team.attackers) {
                            return piece === types.defender || piece === types.king;
                        }
                        return piece === types.attacker;
                    })
                    .filter(function (enemyCell) {
                        var enemy = that.occupant(enemyCell);
                        if (that.sandwiched(enemyCell, end)) {
                            that.deletePiece(enemyCell);
                            if (enemy === types.king) {
                                that.winGame(team.attackers);
                            }
                        }
                    });

                this.internal.activePlayer =
                    (this.activePlayer === team.attackers) ?  team.defenders : team.attackers;
            },

            placePiece: function Board_placePiece(cell, piece) {
                this.internal.state[cell.row][cell.col] = piece;
            },

            deletePiece: function Board_deletePiece(cell) {
                this.internal.state[cell.row][cell.col] = types.none;
            },

            sandwiched: function Board_sandwiched(enemyCell, cell) {
                var piece   = this.occupant(cell),
                    enemy   = this.occupant(enemyCell),
                    oppositeRow,
                    oppositeCol,
                    oppositePiece;

                if (piece === types.king) {
                    throw new Error("not yet implemented");
                }

                if (cell.row === enemyCell.row) {
                    oppositeRow = cell.row;
                    oppositeCol = (enemyCell.col > cell.col)  ? cell.col + 2 : cell.col - 2;
                } else {
                    oppositeRow = (enemyCell.row > cell.row)  ? cell.row + 2 : cell.row - 2;
                    oppositeCol = cell.col;
                }

                oppositePiece = this.occupant(new Cell([oppositeRow, oppositeCol]));

                return oppositePiece === piece
                    || (piece === types.defender
                            && oppositePiece === types.king);
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
                var border, axis, rowStrings;
                rowStrings = this.state.map(function (row, i) {
                    var cellStrings = row.map(function (cell) {
                        return cell.toString();
                    });
                    return "|" + Array.join(cellStrings, " ") + "| " + i;
                });
                border = Array.join(this.state[0].map(function () { return "-"; }), '-');
                axis = Array.join(this.state[0].map(function (val, j) { return j; }), ' ');
                return axis
                    + "\n-"
                    + border
                    + "-\n"
                    + Array.join(rowStrings, "\n")
                    + "\n-"
                    + border;
            },
        };

        return Board;
    }());

    exports.TypeError  = TypeError;
    exports.Move       = Move;
    exports.Board      = Board;
    exports.team       = team;

}(this));
