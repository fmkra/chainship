// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Chainship } from "./Chainship.sol";

abstract contract ChainshipWithMulticall is Chainship {
    constructor(address owner, uint256 contractSeed, uint256 deadlineBlockTime) Chainship(owner, contractSeed, deadlineBlockTime) {}

    function answerAndShoot(RoomId roomId, Position calldata answerPosition, Answer answer, Position calldata shootPosition) public {
        answerShot(roomId, answerPosition, answer);
        shoot(roomId, shootPosition);
    }

    function answerAndClaimVictory(RoomId roomId, Position calldata answerPosition, Answer answer, uint256 boardRandomness, bool[] calldata board, Position[] calldata enemyShots, Answer[] calldata myAnswers, Position[] calldata myShots, Answer[] calldata enemyAnswers) public {
        answerShot(roomId, answerPosition, answer);
        proveVictory(roomId, boardRandomness, board, enemyShots, myAnswers, myShots, enemyAnswers);
    }

    function answerAndClaimDishonest(RoomId roomId, Position calldata answerPosition, Answer answer) public {
        answerShot(roomId, answerPosition, answer);
        claimDishonest(roomId);
    }
}
