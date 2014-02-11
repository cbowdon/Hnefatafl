/*jslint browser:true */
/*globals team */
(function (exports, team) {
    "use strict";

    exports.BoardController = (function BoardControllerClosure() {

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

            boardView.onPlayerChange(activePlayer);

            boardModel.addEventListener("newturn", function (player) {
                redrawCells(boardModel);
                boardView.onPlayerChange(player);
            });

            boardView.addEventListener("playermove", function (move) {
                try {
                    boardModel.update({ player: activePlayer, from: move.from, to: move.to });
                    activePlayer = (activePlayer === team.attackers) ? team.defenders : team.attackers;
                } catch (err) {
                    boardView.onError(err);
                }
            });

            boardModel.addEventListener("victory", boardView.onWin.bind(boardView));

            boardModel.addEventListener("capture", boardView.onCapture.bind(boardView));

            redrawCells(boardModel);
        }

        return BoardController;
    }());

}(this, team));
