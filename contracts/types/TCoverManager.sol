// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

enum Periods {
    Xmonths,
    Ymonths,
    Zmonths,
    Ayear,
    Byear
}

struct CoverDetails {
    uint256 balance;
    Periods period;
    uint256 endDate;
    uint256 premium;
}
