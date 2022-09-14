// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

enum Periods {
    Xdays,
    Ydays,
    Zdays
}

struct CoverDetails {
    uint256 balance;
    uint16 period;
    uint256 endDate;
    uint256 premium;
}
