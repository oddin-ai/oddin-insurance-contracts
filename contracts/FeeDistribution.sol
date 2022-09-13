// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import '../interfaces/IInsurancePool.sol';

contract FeeDistribution is Ownable, ReentrancyGuard {
    // Type declarations:
    using SafeERC20 for IERC20;

    IERC20 public immutable feesToken;
    IInsurancePool public immutable pool;

    uint256 private constant ACC_TOKEN_PRECISION = 1e18;
    uint256 private constant feePerShareRate = 1; // development
    uint256 private constant FEES_PERCENTAGE = 50; // development
    uint256 private constant TOTAL_POOL_SIZE = 1e20; // development

    // User address => feesPerTokenStored
    mapping(address => uint256) public userFeesPerTokenPaid;
    // User address => fees to be claimed
    // mapping(address => uint256) public fees; // why do we need this ????
    // User address => shareInPool to be claimed // development
    mapping(address => uint256) public shareInPool; // development

    constructor(address _feesToken, address _pool) {
        feesToken = IERC20(_feesToken);
        pool = IInsurancePool(_feesToken);
    }

    function claim() external nonReentrant {
        // here we need to check the user share in the pool
        uint256 uShareInPool = pool.ShareInPool();; //pool.ShareInPool(msg.sender);
        require(uShareInPool > 0, 'Claim: user has no share in pool');
        // uint256 feeReward = ((((shareInPool[user] / (TOTAL_POOL_SIZE)) *
        //     (feePerShareRate)) / (ACC_TOKEN_PRECISION)) * (FEES_PERCENTAGE)) /
        //     (100);
        uint256 feeReward = ((uShareInPool *
            feePerShareRate *
            FEES_PERCENTAGE *
            ACC_TOKEN_PRECISION) / 100); //(shareInPool[user] *
        userFeesPerTokenPaid[msg.sender] += feeReward; // need to check what to do with those two params, as we need to subtract the preiously paid 
        //fees[msg.sender] += feeReward;                // and keep track of not over paying
        require(
            feesToken.balanceOf(msg.sender) >= feeReward,
            'Account: Insufficient balance'
        );
        feesToken.safeTransfer(msg.sender, feeReward); // for now fees are in this contract
    }
}
