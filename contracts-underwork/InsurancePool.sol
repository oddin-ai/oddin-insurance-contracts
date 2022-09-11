// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

// import '../interfaces/IInsurancePool.sol';
// IInsurancePool,

contract InsurancePool is
    Initializable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // ------- ^ Type declarations ^ -------

    // State variables:
    mapping(address => uint256) public funds;
    uint256 public minFunding;
    address public NATIVE_STABLE_COIN;
    address private WITHDRAW_CONTRACT;
    address private COVER_MANAGER;
    // ------- ^ State variables ^ -------

    // Events:
    event Deposited(address from, uint256 amount);
    event Withdrawn(address to, uint256 amount);

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize() public initializer {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        minFunding = 50000e18;
        NATIVE_STABLE_COIN = 0x1111111111111111111111111111111111111111;
        // NATIVE_STABLE_COIN = 0x249BE57637D8B013Ad64785404b24aeBaE9B098B;
        WITHDRAW_CONTRACT = 0x2111111111111111111111111111111111111112;
        COVER_MANAGER = 0x3111111111111111111111111111111111111113;
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
            IERC20Upgradeable(NATIVE_STABLE_COIN).balanceOf(msg.sender) >=
                _amount,
            'Account: Insufficient balance'
        );
        // make transfer first
        IERC20Upgradeable(NATIVE_STABLE_COIN).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
        // after approval add fund
        funds[msg.sender] += _amount;
        emit Deposited(msg.sender, _amount);
    }

    function Withdraw(uint256 _amount) external nonReentrant onlyOwner {
        // check amount not 0
        require(_amount > 0, 'Pool: Insufficient withdraw');
        // check there is enough balance for active insurance covers
        require(
            IERC20Upgradeable(NATIVE_STABLE_COIN).balanceOf(address(this)) -
                IERC20Upgradeable(NATIVE_STABLE_COIN).balanceOf(COVER_MANAGER) >
                _amount,
            'Pool: Insufficient available funds'
        );
        funds[msg.sender] -= _amount;
        IERC20Upgradeable(NATIVE_STABLE_COIN).safeTransferFrom(
            address(this),
            WITHDRAW_CONTRACT,
            _amount
        );
        emit Withdrawn(msg.sender, _amount);
    }
}
