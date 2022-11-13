// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
// import './types/TQuoteManager.sol';
import './interfaces/IQuoteManager.sol';
import './interfaces/IInsurancePool.sol';
import 'hardhat/console.sol';

/** @title - QuoteManager contract is tracing all active and inactive covers.
 * @notice - During Beta we'll whitelist every user that wants to buy a cover.
 * @notice - we use checkpoints to track all the coverage changes of every user.
 */
contract QuoteManager is
    IQuoteManager,
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;
    // check type imports
    // ------- ^ Type declarations ^ -------

    // State variables:
    uint16[3] public periods; // days
    uint16 public validDuration; // seconds ( uint16 max 18hours, uint8 max 4.267 mins)

    mapping(address => bool) public whitelistBuyers;

    mapping(address => mapping(uint256 => Quote)) public quotes;

    bytes32 public constant COVER_VERIFIER = keccak256('COVER_VERIFIER');
    IInsurancePool public INSURANCE_POOL;

    /// @notice this is from Comp Goverance contract https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/Comp.sol
    /// @notice A record of amount checkpoints for each account, by index
    mapping(address => mapping(uint32 => Checkpoint)) public checkpoints;

    /// @notice The number of checkpoints for each account
    mapping(address => uint32) public numCheckpoints;
    // ------- ^ State variables ^ -------

    // Events:
    event oddinNewQuote(address, uint256, uint256);
    event QuoteVerified(address, uint256);

    /// @notice this is from Comp Goverance contract https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/Comp.sol
    /// @notice An event thats emitted when a delegate account's cover amount (balance) changes
    event DelegateAmountChanged(
        address indexed delegate,
        uint256 previousBalance,
        uint256 newBalance
    );

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize(
        uint16[3] memory _periods,
        uint16 _validDuration,
        address _insurancePool
    ) public initializer {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
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
        INSURANCE_POOL = IInsurancePool(_insurancePool);
    }

    // ------- ^ Initiation ^ -------

    // Functions:
    //// constructor
    //// receive
    receive() external payable {}

    //// fallback
    fallback() external payable {}

    //// external
    /** @notice - GetQuote is calculating the premium for the coverage amount and duration of the cover */
    function GetQuote(uint256 _amount, Periods _periodtype)
        external
        payable
        returns (uint256, uint256)
    {
        //  Get quote only for whitelisted users
        require(IsApprovedUser(msg.sender), 'QuoteManager: User not approved');

        require(_amount > 0, 'QuoteManager: Insufficient amount');
        require(
            INSURANCE_POOL.CoverAvailability() >= _amount,
            'QuoteManager: Insufficient pool funds'
        );
        uint16 _period = getPeriod(_periodtype);
        (uint256 _qid, uint256 _premium) = calculatePremium(_amount, _period);
        saveQuote(_amount, _period, _premium, _qid);
        emit oddinNewQuote(msg.sender, _qid, _premium);
        return (_qid, _premium);
    }

    /** @notice - function used by admin to approve new users */
    function ApproveUser(address user) external onlyOwner {
        whitelistBuyers[user] = true;
    }

    function IsApprovedUser(address user) public view returns (bool) {
        return whitelistBuyers[user] ? true : false;
    }

    function IsQuoteActive(address _account, uint256 _qid)
        external
        view
        returns (bool, CoverDetails memory)
    {
        console.log('Entered IsQuoteQctive');
        Quote memory _q = quotes[_account][_qid];
        require(
            _q.cover.balance > 0,
            'QuoteManager: No Quotes with given address/QID'
        );
        console.log('Entered IsQuoteQctive ', _q.cover.balance, _q.expiry);
        bool _valid;
        if (_q.expiry > block.timestamp) {
            _valid = true;
        }
        console.log('Entered IsQuoteQctive before return...');
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

    /** notice - verify cover terms used by coverVerify function in the FeeDistribution contract */
    function Verify(address _account, uint256 _qid)
        external
        onlyRole(COVER_VERIFIER)
    {
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
        writeCheckpoint(_account, 1, 0, _q.cover.balance);
        emit QuoteVerified(_account, _qid);
    }

    //// public

    function setCoverVerifier(address _cv)
        public
        onlyOwner
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(COVER_VERIFIER, _cv);
    }

    // function setPoolVerifier(address _cv)
    //     public
    //     onlyOwner
    //     onlyRole(DEFAULT_ADMIN_ROLE)
    // {
    //     grantRole(POOL_VERIFIER, _cv);
    // }

    //// internal
    /** @notice - saves new quote, before verification and payment */
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

    /// @notice this is from Comp Goverance contract https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/Comp.sol
    function safe32(uint256 n, string memory errorMessage)
        internal
        pure
        returns (uint32)
    {
        require(n < 2**32, errorMessage);
        return uint32(n);
    }

    /** @notice - a checkpoint represents every change in the coverage of a user */
    function writeCheckpoint(
        address delegatee,
        uint32 nCheckpoints,
        uint256 oldAmount,
        uint256 newAmount
    ) internal {
        uint32 blockNumber = safe32(
            block.number,
            'QuoteManager:writeCheckpoint: block number exceeds 32 bits'
        );

        if (
            nCheckpoints > 0 &&
            checkpoints[delegatee][nCheckpoints - 1].fromBlock == blockNumber
        ) {
            checkpoints[delegatee][nCheckpoints - 1].amount = newAmount;
        } else {
            checkpoints[delegatee][nCheckpoints] = Checkpoint(
                blockNumber,
                newAmount
            );
            numCheckpoints[delegatee] = nCheckpoints + 1;
        }

        emit DelegateAmountChanged(delegatee, oldAmount, newAmount);
    }

    /**
     * @notice Determine the cover amount for an account as of a block number
     * ,this is from Comp Goverance contract https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/Comp.sol
     * @dev Block number must be a finalized block or else this function will revert to prevent misinformation.
     * @param account The address of the account to check
     * @param blockNumber The block number to get the cover amount at
     * @return The cover amount the account had as of the given block
     */
    function getPriorCover(address account, uint256 blockNumber)
        public
        view
        returns (uint256)
    {
        require(
            blockNumber < block.number,
            'QuoteManager:getPriorCover: not yet determined'
        );

        uint32 nCheckpoints = numCheckpoints[account];
        if (nCheckpoints == 0) {
            return 0;
        }

        // First check most recent balance
        if (checkpoints[account][nCheckpoints - 1].fromBlock <= blockNumber) {
            return checkpoints[account][nCheckpoints - 1].amount;
        }

        // Next check implicit zero balance
        if (checkpoints[account][0].fromBlock > blockNumber) {
            return 0;
        }

        uint32 lower = 0;
        uint32 upper = nCheckpoints - 1;
        while (upper > lower) {
            uint32 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
            Checkpoint memory cp = checkpoints[account][center];
            if (cp.fromBlock == blockNumber) {
                return cp.amount;
            } else if (cp.fromBlock < blockNumber) {
                lower = center;
            } else {
                upper = center - 1;
            }
        }
        return checkpoints[account][lower].amount;
    }
}
