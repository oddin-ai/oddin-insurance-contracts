// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

// import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
// import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

// import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
// import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

interface IInsurancePool {
    function Withdraw(uint256 _amount) external;
}
