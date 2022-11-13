// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '../types/TFeeDistribution.sol';

interface IFeeDistribution {
    function setRewardRate(uint256 _tokenPerSecRate) external;

    function claim() external;

    function VerifyCover(uint256 _qid, uint256 _premiumAmount) external payable;
}
