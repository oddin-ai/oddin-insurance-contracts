// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface IInsurancePool {
    function ActiveCoverage() external;

    function ShareInPool() external;

    function Deposit(uint256 _amount) external payable;

    function Withdraw(uint256 _amount) external;
}
