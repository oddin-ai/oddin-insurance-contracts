// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

import './interfaces/IInsurancePool.sol';

contract InsurancePool is
    IInsurancePool,
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;
    bytes32 public constant COVER_MANAGER = keccak256('COVER_MANAGER');

    // ------- ^ Type declarations ^ -------

    // State variables:
    mapping(address => uint256) public funds;
    uint256 public minFunding;
    uint256 private activeCoverage;
    uint256 private totalFunds;
    address public NATIVE_STABLE;
    // ------- ^ State variables ^ -------

    // Events:
    event PoolFundDeposited(address from, uint256 amount);
    event PoolFundWithdrawn(address to, uint256 amount);

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize(uint256 _minFund, address _nativeStable)
        public
        initializer
    {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        __AccessControl_init();
        minFunding = _minFund;
        NATIVE_STABLE = _nativeStable;
    }

    // ------- ^ Initiation ^ -------

    // Functions:
    //// constructor
    // --

    //// receive
    receive() external payable {}

    //// fallback
    fallback() external payable {}

    //// external

    function Deposit(uint256 _amount) external payable {
        // check that amount is above minimal requirement
        require(_amount >= minFunding, 'Pool: Insufficient fund');
        // check that sender has enough balance
        require(
            IERC20Upgradeable(NATIVE_STABLE).balanceOf(msg.sender) >= _amount,
            'Account: Insufficient balance'
        );
        // make transfer first
        IERC20Upgradeable(NATIVE_STABLE).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
        // after approval add fund
        funds[msg.sender] += _amount;
        totalFunds += _amount;
        emit PoolFundDeposited(msg.sender, _amount);
    }

    function Withdraw(uint256 _amount) external nonReentrant {
        // check amount not 0
        require(_amount > 0, 'Pool: Insufficient withdraw');
        uint256 available = totalFunds - activeCoverage;
        // check there is enough balance for active insurance covers
        require(available >= _amount, 'Pool: Insufficient available funds ');
        funds[msg.sender] -= _amount;
        totalFunds -= _amount;
        IERC20Upgradeable(NATIVE_STABLE).safeTransferFrom(
            address(this),
            msg.sender,
            _amount
        );
        emit PoolFundWithdrawn(msg.sender, _amount);
    }

    function ActiveCoverage() external view returns (uint256) {
        return activeCoverage;
    }

    function ShareInPool(address _account)
        external
        view
        returns (uint256, uint256)
    {
        return (funds[_account], totalFunds);
    }

    function updateActiveCoverage(bool _new, uint256 _amount)
        external
        returns (bool)
    {
        require(hasRole(COVER_MANAGER, msg.sender), 'Pool: NOT Authorized');
        require(_amount > 0, 'Pool: Insufficient cover amount');
        if (!_new) {
            activeCoverage -= _amount;
        } else {
            activeCoverage += _amount;
        }

        return true;
    }

    //// public
    function setCoverManager(address _cm) public onlyOwner {
        grantRole(COVER_MANAGER, _cm);
    }

    //// internal

    function _authorizeUpgrade(address) internal override onlyOwner {}
    //// private
    //// view / pure
}
