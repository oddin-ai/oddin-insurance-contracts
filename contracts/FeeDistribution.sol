// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import './interfaces/IInsurancePool.sol';

import 'hardhat/console.sol';

contract FeeDistribution is Ownable, ReentrancyGuard {
    // Type declarations:
    using SafeERC20 for IERC20;

    IERC20 public immutable feesToken;
    IInsurancePool public immutable pool;
    address public immutable coverMgmtAddress;
    uint256 public tokenPerSecRate;

    uint256 private constant ACC_TOKEN_PRECISION = 1e18;
    uint256 private constant FEES_PERCENTAGE = 50; // development

    // User address => feesPerTokenStored
    mapping(address => uint256) public userFeesPerTokenPaid;
    // User address => fees to be claimed
    // mapping(address => uint256) public fees; // why do we need this ????
    // User address => shareInPool to be claimed // development
    mapping(address => uint256) public shareInPool; // development

    event CoverVerified(address _member);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);

    // need to check how much of the fees that are stored in this contract we need to distribute!!!

    constructor(
        address _feesToken,
        address _pool,
        address _coverMgmtAddress,
        uint256 _tokenPerSecRate
    ) {
        feesToken = IERC20(_feesToken);
        pool = IInsurancePool(_pool);
        coverMgmtAddress = _coverMgmtAddress;
        tokenPerSecRate = _tokenPerSecRate;
    }

    /// @notice Sets the distribution reward rate. This will also update the poolInfo.
    /// @param _tokenPerSecRate The number of tokens to distribute per second per share in insurance pool
    function setRewardRate(uint256 _tokenPerSecRate) external onlyOwner {
        // updatePool();

        uint256 oldRate = tokenPerSecRate;
        tokenPerSecRate = _tokenPerSecRate;

        emit RewardRateUpdated(oldRate, _tokenPerSecRate);
    }

    function claim() external nonReentrant {
        // here we need to check the user share in the pool
        (uint256 uShareInPool, uint256 poolTotal) = pool.ShareInPool(
            msg.sender
        );
        require(uShareInPool > 0, 'Claim: user has no share in pool');
        // uint256 feeReward = ((((shareInPool[user] / (TOTAL_POOL_SIZE)) *
        //     (tokenPerSecRate)) / (ACC_TOKEN_PRECISION)) * (FEES_PERCENTAGE)) /
        //     (100);
        uint256 coverPremium = feesToken.balanceOf(address(this));
        uint256 feeReward = ((coverPremium *
            uShareInPool *
            tokenPerSecRate *
            FEES_PERCENTAGE) / (poolTotal * 100 * 10));
        // ACC_TOKEN_PRECISION) / (poolTotal * 100 * 10)); //(shareInPool[user] *
        userFeesPerTokenPaid[msg.sender] += feeReward; // need to check what to do with those two params, as we need to subtract the preiously paid
        //fees[msg.sender] += feeReward;                // and keep track of not over paying
        console.log('fee to claim is: %s', feeReward);
        require(coverPremium >= feeReward, 'Account: Insufficient balance');
        feesToken.safeTransfer(msg.sender, feeReward);
    }

    function VerifyCover() external payable {
        // _RegisterNewCover(CoverDetails(_amount, _period, _endDate, _premium));
        // pool.updateActiveCoverage(true, _addAmount);
        emit CoverVerified(msg.sender);
    }
}
