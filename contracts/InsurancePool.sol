// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

// import '../interfaces/IInsurancePool.sol';
// IInsurancePool,

contract InsurancePool is
    Initializable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // ------- ^ Type declarations ^ -------

    // State variables:
    mapping(address => uint256) public funds;
    uint256 public minFunding;
    address public NATIVE_STABLE;
    address private WITHDRAW_MANAGER;
    address private COVER_MANAGER;
    // ------- ^ State variables ^ -------

    // Events:
    event PoolFundDeposited(address from, uint256 amount);
    event PoolFundWithdrawn(address to, uint256 amount);

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize(
        uint256 _minFund,
        address _nativeStable,
        address _coverManager,
        address _withdrawManager
    ) public initializer {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        minFunding = _minFund;
        NATIVE_STABLE = _nativeStable; // 0x1111111111111111111111111111111111111111;
        COVER_MANAGER = _coverManager; //0x3111111111111111111111111111111111111113;
        WITHDRAW_MANAGER = _withdrawManager; // 0x2111111111111111111111111111111111111112;
    }

    // ------- ^ Initiation ^ -------

    // Functions:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    receive() external payable {}

    fallback() external payable {}

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
        emit PoolFundDeposited(msg.sender, _amount);
    }

    function Withdraw(uint256 _amount) external nonReentrant {
        // check amount not 0
        require(_amount > 0, 'Pool: Insufficient withdraw');
        uint256 available = AvailableWithdraw();
        // check there is enough balance for active insurance covers
        require(available > _amount, 'Pool: Insufficient available funds ');
        funds[msg.sender] -= _amount;
        IERC20Upgradeable(NATIVE_STABLE).safeTransferFrom(
            address(this),
            WITHDRAW_MANAGER,
            _amount
        );
        emit PoolFundWithdrawn(msg.sender, _amount);
    }

    function AvailableWithdraw() public view returns (uint256) {
        return
            IERC20Upgradeable(NATIVE_STABLE).balanceOf(address(this)) -
            IERC20Upgradeable(COVER_MANAGER).totalSupply(); // custom function in the future
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
