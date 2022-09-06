// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';

/**
  IMPORTANT!!! 
  storage sequence matters as evm references location in storage
  Therefore parent dependencies and their variables need to be kept in consistent amount and sequence


 */
contract Pool is Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable {
    // Type declarations:
    // using SafeMathUpgradeable for uint256; not needed in v0.8
    using SafeERC20Upgradeable for IERC20Upgradeable;
    struct CoverData {
        // token ?
        // insuredAmount ?
        // premium ?
        uint256 coverAmount;
    }

    // ------- ^ Type declarations ^ -------

    // State variables:

    // address[] public insured; or use array???
    // should it be token-->wallet-->data
    // or wallet-->token-->data?
    mapping(address => mapping(address => CoverData)) public insured;
    // or wallet-->dataArray with token in CoverData?
    // mapping(address => CoverData[]) public covers;

    // ------- ^ State variables ^ -------

    // Events:
    event Covered();
    event UnCovered();

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize() public initializer {}

    // ------- ^ Initiation ^ -------

    // Functions:

    // fallback function needed

    function Deposit(uint256 _amount, address _token) external payable {
        require(
            requestTokenCover(_amount, _token),
            'Pool: Unexpected request for insurance cover'
        );
        IERC20Upgradeable(_token).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        emit Covered();
    }

    function Withdraw(uint256 _amount, address _token)
        external
        nonReentrant
        onlyOwner
    {
        // [TODO] isContract is not 100% accurate as call from constractor looks like EOA
        // can break in future use-cases for interaction with contracts
        // and doesn't protect from flash-loans
        // if (!_token.isContract()) {
        //     return false;
        // }
        IERC20Upgradeable token = IERC20Upgradeable(_token);
        // [TODO] continue function activation for withdraw
        // bytes memory data = abi.encodeWithSelector(
        //     token.safeTransfer.selector,
        // );
        emit UnCovered();
    }

    function TotalActiveCovering() internal {}

    // should be in logic contract
    function isAllowedToken(address token) public returns (bool) {}

    function addAllowedToken(address token) public onlyOwner returns (bool) {}

    function requestTokenCover(uint256 _amount, address _token)
        internal
        returns (bool)
    {
        require(isAllowedToken(_token), 'Pool: Unexpected token');
        // [TODO] continue logic...
    }
    // ------- ^ should be in logic contract ^ -------
}
