// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
// import './types/TQuoteManager.sol';
import './interfaces/IQuoteManager.sol';
import 'hardhat/console.sol';

contract QuoteManager is
    IQuoteManager,
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;
    // check type imports
    // ------- ^ Type declarations ^ -------

    // State variables:
    uint16[3] public periods; // days
    uint16 public validDuration; // seconds ( uint16 max 18hours, uint8 max 4.267 mins)

    mapping(address => mapping(uint256 => Quote)) public quotes;

    bytes32 public constant COVER_VERIFIER = keccak256('COVER_VERIFIER');

    // ------- ^ State variables ^ -------

    // Events:
    event oddinNewQuote(address, uint256, uint256);
    event QuoteVerified(address, uint256);

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize(uint16[3] memory _periods, uint16 _validDuration)
        public
        initializer
    {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, owner());

        for (uint8 i = 1; i < periods.length; i += 1) {
            require(
                _periods[i - 1] < _periods[i],
                'Periods are not sequential scaling up'
            );
        }
        require(_validDuration > 0, 'Valid duration is too short');
        periods = _periods;
        validDuration = _validDuration;
    }

    // ------- ^ Initiation ^ -------

    // Functions:
    //// constructor
    //// receive
    receive() external payable {}

    //// fallback
    fallback() external payable {}

    //// external
    function GetQuote(uint256 _amount, Periods _periodtype)
        external
        payable
        returns (uint256, uint256)
    {
        require(_amount > 0, 'QuoteManager: Insufficient amount');
        uint16 _period = getPeriod(_periodtype);
        (uint256 _qid, uint256 _premium) = calculatePremium(_amount, _period);
        saveQuote(_amount, _period, _premium, _qid);
        emit oddinNewQuote(msg.sender, _qid, _premium);
        return (_qid, _premium);
    }

    function IsQuoteActive(address _account, uint256 _qid)
        external
        view
        returns (bool, CoverDetails memory)
    {
        Quote memory _q = quotes[_account][_qid];
        require(
            _q.cover.balance > 0,
            'QuoteManager: No Quotes with given address/QID'
        );

        bool _valid;
        if (_q.expiry > block.timestamp) {
            _valid = true;
        }
        return (_valid, _q.cover);
    }

    function GetQuoteData(address _account, uint256 _qid)
        external
        view
        returns (Quote memory)
    {
        Quote memory _q = quotes[_account][_qid];

        require(
            _q.expiry > 0,
            'QuoteManager: No Quotes with given address/QID'
        );
        return quotes[_account][_qid];
    }

    function Verify(address _account, uint256 _qid) external {
        require(
            hasRole(COVER_VERIFIER, msg.sender),
            'QuoteManager: NOT Authorized to verify'
        );
        Quote memory _q = quotes[_account][_qid];
        require(
            _q.expiry > 0,
            'QuoteManager: No Quotes with given address/QID'
        );
        require(_q.verified != true, 'QuoteManager: Quote already verified');
        _q.verified = true;
        quotes[_account][_qid] = _q;
        emit QuoteVerified(_account, _qid);
    }

    //// public

    function setCoverVerifier(address _cv) public onlyOwner {
        grantRole(COVER_VERIFIER, _cv);
    }

    //// internal
    function saveQuote(
        uint256 _amount,
        uint16 _period,
        uint256 _premium,
        uint256 _qid
    ) internal {
        require(_premium > 0, 'QuoteManager: Error in premium');
        require(_period > 0, 'QuoteManager: Error in period');
        uint256 _currentDate = block.timestamp;
        uint256 _expiry = _currentDate + validDuration;
        uint256 _endDate = _currentDate + getPeriodDuration(_period);
        // check current cover details
        quotes[msg.sender][_qid] = Quote(
            CoverDetails(_amount, _period, _endDate, _premium),
            _expiry,
            false
        );
    }

    function calculatePremium(uint256 _amount, uint16 _period)
        internal
        pure
        returns (uint256, uint256)
    {
        // option A - make internal with params address, amount, period
        // option B - make oracle address, amount, period
        require(_period > 0, 'QuoteManager: minimum period is 1day');
        require(_period < 366, 'QuoteManager: maximum period is 365days');
        //  rate: 250 / 10000 = 2.5% , share from year: period / 365
        uint256 _qid = 123; // should be the id of quote received back
        return (_qid, ((_amount * 250 * _period) / 3650000));
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    //// private
    //// view / pure

    /// @notice Get the days of a pre-defined period
    function getPeriod(Periods _periodtype) internal view returns (uint16) {
        require(
            uint8(_periodtype) < periods.length,
            'Invalid period, duration unavailable'
        );
        return periods[uint8(_periodtype)];
    }

    /// @notice Get the duration of a pre-defined period days in seconds
    function getPeriodDuration(uint16 _period) internal pure returns (uint32) {
        return uint32(_period) * (1 days);
    }
}
