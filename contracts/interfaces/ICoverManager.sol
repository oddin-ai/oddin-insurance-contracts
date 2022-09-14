// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;
import '../types/TCoverManager.sol';

interface ICoverManager {
    function RegisterCover(uint256 _amount, Periods _period) external payable;

    function CalculatePremium(uint256 _amount, Periods _period)
        external
        view
        returns (uint256);

    function ActiveCoverage() external view returns (uint256);

    function ActivelyCoverageByDate(uint256 _date) external;

    function IsCovered(address _account) external view returns (bool);

    function getCoverData(address _account)
        external
        view
        returns (CoverDetails memory);
}
