// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import './TCoverManager.sol';

struct Quote {
    CoverDetails cover;
    uint256 expiry;
    bool verified;
}

/// @notice A checkpoint for marking number of votes from a given block
struct Checkpoint {
    uint32 fromBlock;
    uint256 amount;
}
