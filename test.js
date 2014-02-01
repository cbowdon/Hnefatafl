/*jslint browser:true, node: true */
(function (exports) {
  "use strict";

  exports.test = function (board, team) {

    board.update({ player: team.defenders, from: [3, 5], to: [2, 5] });
    board.update({ player: team.attackers, from: [1, 5], to: [1, 1] });
    board.update({ player: team.defenders, from: [5, 3], to: [2, 3] });
    board.update({ player: team.attackers, from: [5, 1], to: [9, 1] });
    board.update({ player: team.defenders, from: [4, 7], to: [4, 10] });

    console.log(board.state);
  };

}(this));
