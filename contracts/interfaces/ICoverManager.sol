// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;
import '../types/enums.sol';

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
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        );
}
