// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

interface IInsurancePool {
    function Deposit(uint256 _amount) external payable;

    function Withdraw(uint256 _amount) external;

    function updateActiveCoverage(bool _add, uint256 _amount)
        external
        returns (bool);

    function ActiveCoverage() external view returns (uint256);

    function ShareInPool(address _account)
        external
        view
        returns (uint256, uint256);
}
