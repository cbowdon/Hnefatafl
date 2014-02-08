/*jslint browser:true */
/*globals Board, BoardView, typeViewInfo, team */
(function (document, Board, BoardView, typeViewInfo, team) {
    "use strict";

    var BoardController = (function BoardControllerClosure() {

        function BoardController(boardModel, boardView) {
            var activePlayer = boardModel.activePlayer;

            function redrawCells(boardModel) {
                boardModel.state.forEach(function (row, r) {
                    row.forEach(function (col, c) {
                        var type = boardModel.state[r][c];
                        boardView.draw(type.symbol, r, c);
                    });
                });
            }

            boardView.addEventListener("playermove", function (move) {

                try {
                    boardModel.update({ player: activePlayer, from: move.from, to: move.to });
                    activePlayer = (activePlayer === team.attackers) ? team.defenders : team.attackers;
                } catch (err) {
                    boardView.error(err);
                }

                if (boardModel.finished) {
                    boardView.winner(boardModel.winner);
                }

                redrawCells(boardModel);
            });

            redrawCells(boardModel);
        }

        return BoardController;
    }());

    document.addEventListener("DOMContentLoaded", function () {
        var boardModel = new Board(),
            boardView = new BoardView("#boardCanvas", typeViewInfo),
            boardController = new BoardController(boardModel, boardView);
    });

}(document, Board, BoardView, typeViewInfo, team));
