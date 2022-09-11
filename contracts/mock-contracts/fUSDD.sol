// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract FUSDDToken is ERC20 {
    constructor(uint256 initialSupply) ERC20('fuseDoubleDollar', 'FUSDD') {
        _mint(msg.sender, initialSupply);
    }
}
