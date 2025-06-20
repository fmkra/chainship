// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Chainship } from '../Chainship.sol';

contract TestInternals is Chainship {
    constructor() Chainship(0x0, 10) {}

    function calculateCommission(uint256 entryFee) public pure override returns (uint256) {
        return 0;
    }

    function isSinkHit(bool[] calldata board, bool[] memory hits, uint16 position) pure external returns (bool) {
        return _isSinkHit(board, hits, position);
    }

    function verifyAnswerCorrectness(bool[] calldata board, Position[] calldata shots, Answer[] calldata answers) pure external {
        _verifyAnswerCorrectness(board, shots, answers);
    }

    function verifyBoard(uint256 boardRandomness, bool[] calldata board) view external returns (uint256) {
        return _verifyBoard(boardRandomness, board);
    }
}
