// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract FeeDistribution is Ownable, ReentrancyGuard {
    // Type declarations:
    using SafeERC20 for IERC20;

    IERC20 public immutable feesToken;
    uint256 private constant ACC_TOKEN_PRECISION = 1e18;
    uint256 private constant feePerShareRate = 1000; // development
    uint256 private constant FEES_PERCENTAGE = 50; // development
    uint256 private constant TOTAL_POOL_SIZE = 1e20; // development

    // User address => feesPerTokenStored
    mapping(address => uint256) public userFeesPerTokenPaid;
    // User address => fees to be claimed
    mapping(address => uint256) public fees; // why do we need this ????
    // User address => shareInPool to be claimed // development
    mapping(address => uint256) public shareInPool; // development

    constructor(address _feesToken) {
        feesToken = IERC20(_feesToken);
    }

    function claim() external nonReentrant {
        address user = msg.sender;

        uint256 feeReward = ((((shareInPool[user] / (TOTAL_POOL_SIZE)) *
            (feePerShareRate)) / (ACC_TOKEN_PRECISION)) * (FEES_PERCENTAGE)) /
            (100);
        userFeesPerTokenPaid[user] += feeReward;
        fees[user] += feeReward;
        feesToken.safeTransferFrom(address(this), user, feeReward); // for now fees are in this contract
    }
}
