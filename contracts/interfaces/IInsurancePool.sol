// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface IInsurancePool {
    function ActiveCoverage() external view returns (uint256);

    function ShareInPool(address _account)
        external
        view
        returns (uint256, uint256);

    function Deposit(uint256 _amount) external payable;

    function Withdraw(uint256 _amount) external;
}
