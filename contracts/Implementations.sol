// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { ChainshipWithMulticall } from "./Multicall.sol";

contract TestContract is ChainshipWithMulticall {
    constructor(address owner, uint256 contractSeed) ChainshipWithMulticall(owner, contractSeed, 10) {}
    uint256 public x;

    function calculateCommission(uint256 entryFee) public pure override returns (uint256) {
        // around 0.02 USD + 0.1% of entry fee
        return 10000 gwei + entryFee / 1000;
    }
}

contract ChainshipNoFee is ChainshipWithMulticall {
    constructor(uint256 contractSeed) ChainshipWithMulticall(address(this), contractSeed, 10 * 60 / 12) {} // 10 minutes

    function calculateCommission(uint256 entryFee) public pure override returns (uint256) {
        require(entryFee > 0, "Entry fee must be greater than 0");
        return 0;
    }
}
