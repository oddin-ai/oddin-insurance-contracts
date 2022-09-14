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
    // **CoverDetails is imported
    // ------- ^ Type declarations ^ -------

    // State variables:
    uint32[5] periodDuration; // will be cheaper to use month ranges
    mapping(address => CoverDetails) public covers;
    uint256 public totalCovers;
    IERC20Upgradeable private NATIVE_STABLE;
    IInsurancePool private INSURANCE_POOL;
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
        uint32[5] memory _periodDuration
    ) public initializer {
        // add initializers/constructors of parent libraries
        __Ownable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        NATIVE_STABLE = IERC20Upgradeable(_nativeStable);
        INSURANCE_POOL = IInsurancePool(_insurancePool);
        for (uint8 i; i < 4; i += 1) {
            require(
                _periodDuration[i] < _periodDuration[i + 1],
                'Period Durations are not sequential'
            );
        }
        periodDuration = _periodDuration;
    }

    // ------- ^ Initiation ^ -------

    // Functions:
    //// constructor
    //// receive
    receive() external payable {}

    //// fallback
    fallback() external payable {}

    //// external

    function RegisterCover(uint256 _amount, Periods _period) external payable {
        require(_amount > 0, 'CoverManager: Insufficient amount');
        if (covers[msg.sender].balance == 0) {
            CoverDetails memory cd;
            cd.period = _period;
            cd.endDate = block.timestamp + getPeriodDuration(_period);
            cd.premium = CalculatePremium(_amount, _period);
            cd.balance = _amount;
            covers[msg.sender] = cd;
        } else {
            // 1. unregister previous cover
            // 2. register new cover
        }
        emit CoverRegistered(msg.sender, _amount, _period);
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
    function CalculatePremium(uint256 _amount, Periods _period)
        public
        pure
        override
        returns (uint256)
    {
        // option A - make internal with params address, amount, period
        // option B - make oracle address, amount, period
        return 25;
    }

    //// internal
    function _authorizeUpgrade(address) internal override onlyOwner {}

    //// private
    //// view / pure

    /// @notice Get the duration of a pre-defined period in seconds
    function getPeriodDuration(Periods _period) public view returns (uint256) {
        require(
            uint8(_period) < periodDuration.length,
            'Invalid period, duration unavailable'
        );
        return periodDuration[uint8(_period)];
    }
}
