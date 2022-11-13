// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

import './interfaces/IInsurancePool.sol';
import './interfaces/IQuoteManager.sol';
import './interfaces/IFeeDistribution.sol';

import 'hardhat/console.sol';

error NotPartOfThePool(uint256 partOfPool);
error InsufficientBalance(uint256 balance);
error CoverNotActive();
error CoverFeeAmountNotSufficiant();

contract FeeDistribution is
    IFeeDistribution,
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IERC20Upgradeable public feesToken;
    IInsurancePool public INSURANCE_POOL;
    IQuoteManager public quoteManager;

    uint256 public tokenPerSecRate;
    uint256 private constant ACC_TOKEN_PRECISION = 1e18;
    uint256 private constant FEES_PERCENTAGE = 50; // development

    // User address => feesPerTokenStored
    mapping(address => uint256) public userFeesPerTokenPaid;
    // User address => fees to be claimed
    // mapping(address => uint256) public fees; // why do we need this ????
    // User address => shareInPool to be claimed // development
    mapping(address => uint256) public shareInPool; // development

    /// @notice Info of the poolInfo.
    FeeInfo public sFeeInfo;

    event CoverVerified(address _member);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);

    // need to check how much of the fees that are stored in this contract we need to distribute!!!

    function initialize(
        address _feesToken,
        address _insurancePool,
        address _quoteManagerAddress,
        uint256 _tokenPerSecRate
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, owner());
        feesToken = IERC20Upgradeable(_feesToken);
        INSURANCE_POOL = IInsurancePool(_insurancePool);
        quoteManager = IQuoteManager(_quoteManagerAddress);
        tokenPerSecRate = _tokenPerSecRate;
        sFeeInfo = FeeInfo({
            accTokenPerShare: 0,
            lastFeeDistributionTimestamp: block.timestamp
        });
    }

    //// receive
    receive() external payable {}

    //// fallback
    fallback() external payable {}

    /// @notice Sets the distribution reward rate. This will also update the feesInfo.
    /// @param _tokenPerSecRate The number of tokens to distribute per second per share in insurance pool
    function setRewardRate(uint256 _tokenPerSecRate) external onlyOwner {
        // uint256 coverPremium = feesToken.balanceOf(address(this));
        // updateFeesInfo(coverPremium);
        updateFeesInfo();

        uint256 oldRate = tokenPerSecRate;
        tokenPerSecRate = _tokenPerSecRate;

        emit RewardRateUpdated(oldRate, _tokenPerSecRate);
    }

    /// @notice Update reward variables of the.
    function updateFeesInfo() internal returns (FeeInfo memory feesInfo) {
        feesInfo = sFeeInfo;
        // Do I need to check if there is something left in balace???
        if (block.timestamp > feesInfo.lastFeeDistributionTimestamp) {
            uint256 timeElapsed = block.timestamp -
                feesInfo.lastFeeDistributionTimestamp; // from here we will calculate how much to allocate for each share
            console.log('time Elapsed: %s', timeElapsed);
            uint256 tokenReward = timeElapsed * tokenPerSecRate;
            feesInfo.accTokenPerShare += (tokenReward * ACC_TOKEN_PRECISION);
            console.log('accTokenPerShare: %s', feesInfo.accTokenPerShare);
        }

        feesInfo.lastFeeDistributionTimestamp = block.timestamp;
        sFeeInfo = feesInfo;
    }

    function claim() external nonReentrant {
        // here we need to check the user share in the pool
        (uint256 uShareInPool, uint256 poolTotal) = INSURANCE_POOL.ShareInPool(
            msg.sender
        );
        console.log('user share in pool: %s', uShareInPool);
        console.log('Total in pool: %s', poolTotal);

        //require(uShareInPool > 0, 'Claim: user has no share in pool');
        if (uShareInPool <= 0) {
            revert NotPartOfThePool(uShareInPool);
        }
        uint256 coverPremium = feesToken.balanceOf(address(this));
        FeeInfo memory feesInfo = updateFeesInfo();

        uint256 uRewardDept = userFeesPerTokenPaid[msg.sender];
        uint256 feeReward = ((FEES_PERCENTAGE *
            feesInfo.accTokenPerShare *
            uShareInPool) / (ACC_TOKEN_PRECISION * poolTotal * 100));
        userFeesPerTokenPaid[msg.sender] = feeReward; // need to check what to do with those two params, as we need to subtract the preiously paid
        //fees[msg.sender] += feeReward;                // and keep track of not over paying
        uint256 userAmount = feeReward - uRewardDept;
        console.log('fee to claim is: %s', userAmount);
        // require(coverPremium >= userAmount, 'Account: Insufficient balance');
        if (coverPremium < userAmount) {
            revert InsufficientBalance(userAmount);
        }
        feesToken.safeTransfer(msg.sender, userAmount);
    }

    function VerifyCover(uint256 _qid, uint256 _premiumAmount)
        external
        payable
        nonReentrant
    {
        require(
            INSURANCE_POOL.CoverAvailability() >= _premiumAmount,
            'QuoteManager: Insufficient pool funds'
        );
        console.log('before checking active quote with %s', _qid);
        try quoteManager.IsQuoteActive(msg.sender, _qid) returns (
            bool active,
            CoverDetails memory cd
        ) {
            // TODO: also require the quate to be not verified!!!
            if (!active) {
                revert CoverNotActive();
            }
            uint256 _premium = cd.premium;
            if (_premiumAmount < _premium) {
                revert CoverFeeAmountNotSufficiant();
            }
            console.log('premium to pay: %s', _premium);
            feesToken.safeTransferFrom(msg.sender, address(this), _premium);
            console.log('we passed safeTransferFrom with %s', _qid);
            quoteManager.Verify(msg.sender, _qid);
            INSURANCE_POOL.updateActiveCoverage(true, _premium);
            emit CoverVerified(msg.sender);
        } catch Error(string memory err) {
            console.log('Error catch ${err}', err);
        } catch (bytes memory _err) {
            emit BytesFailure(_err);
        }
    }

    event BytesFailure(bytes bytesFailure);

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
