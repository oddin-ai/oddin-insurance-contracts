// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import './interfaces/ICoverManager.sol';
import './interfaces/IInsurancePool.sol';
import './types/TCoverManager.sol';

contract CoverManager is
    ICoverManager,
    Initializable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    // Type declarations:
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // **Periods is imported
    //     enum Periods {
    //     Xdays,
    //     Ydays,
    //     Zdays
    // }
    // **CoverDetails is imported
    //     struct CoverDetails {
    //     uint256 balance;
    //     uint16 period;
    //     uint256 endDate;
    //     uint256 premium;
    // }
    // ------- ^ Type declarations ^ -------

    // State variables:
    uint16[3] periods; // will be cheaper to use month ranges
    mapping(address => CoverDetails) public covers;
    uint256 public totalCovers;
    IERC20Upgradeable public STABLE_COIN;
    IInsurancePool public INSURANCE_POOL;
    // ------- ^ State variables ^ -------

    // Events:
    event CoverRegistered(address _member, uint256 _amount, Periods _period);

    // event CoverUnregistered(address owner, bytes32 txHash);

    // ------- ^ Events ^ -------

    // Modifiers:

    // ------- ^ Modifiers ^ -------

    // Initiation:
    function initialize(
        address _nativeStable,
        address _insurancePool,
        uint16[3] memory _periods
    ) public initializer {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        STABLE_COIN = IERC20Upgradeable(_nativeStable);
        INSURANCE_POOL = IInsurancePool(_insurancePool);
        for (uint8 i = 1; i < periods.length; i += 1) {
            require(
                _periods[i - 1] < _periods[i],
                'Periods are not sequential scaling up'
            );
        }
        periods = _periods;
    }

    // ------- ^ Initiation ^ -------

    // Functions:
    //// constructor
    //// receive
    receive() external payable {}

    //// fallback
    fallback() external payable {}

    //// external

    function RegisterCover(uint256 _amount, Periods _periodtype)
        external
        payable
    {
        require(_amount > 0, 'CoverManager: Insufficient amount');
        uint256 _currentDate = block.timestamp;
        // new cover details
        uint16 _period = getPeriod(_periodtype);
        uint256 _premium = CalculatePremium(_amount, _period);
        uint256 _endDate = _currentDate + getPeriodDuration(_period);
        uint256 _addAmount = _amount; // amount to add to pool
        // check current cover details
        CoverDetails memory _currectCover = covers[msg.sender];
        if (
            _currectCover.balance != 0 && _currentDate < _currectCover.endDate
        ) {
            // check exparetion
            uint256 _periodLeft = (_currectCover.endDate - _currentDate) /
                (1 days);
            if (_periodLeft > 0) {
                _addAmount -= _currectCover.balance;
                // _UnregisterCover(_periodLeft, _currectCover.premium);
            }
        }
        // !!! not to send back tokens, but to transfer the difference and update accordingly
        // require balance will be higher than new premium after returning the left over premium
        // require();
        _RegisterNewCover(CoverDetails(_amount, _period, _endDate, _premium));
        INSURANCE_POOL.updateActiveCoverage(true, _addAmount);
        emit CoverRegistered(msg.sender, _amount, _periodtype);
    }

    function ActiveCoverage() external view returns (uint256) {
        return INSURANCE_POOL.ActiveCoverage();
    }

    function ActivelyCoverageByDate(uint256 _date) external {
        // for calculating we need to itterate on all covers,
        // need to save array of members (can't)
    }

    function IsCovered(address _account) external view override returns (bool) {
        if (
            covers[_account].balance == 0 ||
            covers[_account].endDate < block.timestamp
            // timestamp will be of previous block becuase it is not used in a transaction
            // additionally block miners have 900 sec margin...
        ) {
            return false;
        }
        return true;
    }

    function getCoverData(address _account)
        external
        view
        override
        returns (CoverDetails memory)
    {
        return covers[_account];
    }

    //// public
    function CalculatePremium(uint256 _amount, uint16 _period)
        public
        pure
        override
        returns (uint256)
    {
        // option A - make internal with params address, amount, period
        // option B - make oracle address, amount, period
        require(_period > 0, 'CoverManager: minimum period is 1day');
        require(_period < 366, 'CoverManager: maximum period is 365days');
        //  rate: 250 / 10000 = 2.5% , share from year: period / 365
        return ((_amount * 250 * _period) / 3650000);
    }

    //// internal
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function _RegisterNewCover(CoverDetails memory _coverDetails) internal {
        covers[msg.sender] = _coverDetails;
    }

    function _UpdateCover() internal {}

    function _UnregisterCover(uint256 _periodLeft, uint256 _CurrentPremium)
        internal
    {}

    //// private
    //// view / pure

    /// @notice Get the duration of a pre-defined period in seconds
    function getPeriod(Periods _periodtype) public view returns (uint16) {
        require(
            uint8(_periodtype) < periods.length,
            'Invalid period, duration unavailable'
        );
        return periods[uint8(_periodtype)];
    }

    /// @notice Get the duration of a pre-defined period in seconds
    function getPeriodDuration(uint16 _period) internal pure returns (uint32) {
        return _period * (1 days);
    }
}
