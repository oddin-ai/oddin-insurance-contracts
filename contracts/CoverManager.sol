// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

contract CoverManager is
    Initializable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;
    struct CoverData {
        uint256 amount;
        bytes32 txHash;
    }
    // ------- ^ Type declarations ^ -------

    // State variables:
    mapping(address => uint256) public covers;
    uint256 public totalCovers;
    address public NATIVE_STABLE;
    address private INSURANCE_POOL;
    // ------- ^ State variables ^ -------

    // Events:
    event CoverRegistered(address owner, bytes32 txHash);
    event CoverUnregistered(address owner, bytes32 txHash);

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize(address _nativeStable, address _insurancePool)
        public
        initializer
    {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        NATIVE_STABLE = _nativeStable; // 0x1111111111111111111111111111111111111111;
        INSURANCE_POOL = _insurancePool; //0x3111111111111111111111111111111111111113;
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

    function RegisterCover(bytes32 txHash) external payable {
        emit CoverRegistered(msg.sender, txHash);
    }

    function UnRegisterCover(bytes32 txHash) external nonReentrant {
        emit CoverUnregistered(msg.sender, txHash);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
