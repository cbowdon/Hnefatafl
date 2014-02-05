/*jslint browser:true */
/*globals $, Board, BoardView */
(function (document, $) {
    "use strict";

    var BoardController = (function BoardControllerClosure() {

        function BoardController(boardModel, boardView) {

        }

        return BoardController;
    }());

    $(document).ready(function () {

        var boardModel = new Board(),
            boardView = new BoardView("#boardCanvas"),
            boardController = new BoardController(boardModel, boardView);
    });

}(document, $));
