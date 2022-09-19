// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;
import '../types/TQuoteManager.sol';

interface IQuoteManager {
    function GetQuote(uint256 _amount, Periods _periodtype)
        external
        payable
        returns (uint256, uint256);

    function IsQuoteActive(address _account, uint256 _qid)
        external
        view
        returns (bool, CoverDetails memory);

    function GetQuoteData(address _account, uint256 _qid)
        external
        view
        returns (Quote memory);
}