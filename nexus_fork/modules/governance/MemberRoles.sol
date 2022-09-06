// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.5.0;

import "../../interfaces/IClaimsReward.sol";
import "../../interfaces/IGovernance.sol";
import "../../interfaces/IMemberRoles.sol";
import "../../interfaces/IQuotationData.sol";
import "../../interfaces/ITokenController.sol";
import "../../interfaces/ITokenData.sol";
import "../../interfaces/ITokenFunctions.sol";
import "../claims/ClaimsReward.sol";
import "./external/Governed.sol";

contract MemberRoles is IMemberRoles, Governed, LegacyMasterAware {

  ITokenController public tc;
  ITokenData internal td;
  IQuotationData internal qd;
  IClaimsReward internal cr;
  IGovernance internal gv;
  ITokenFunctions internal tf;
  INXMToken public tk;

  struct MemberRoleDetails {
    uint memberCounter;
    mapping(address => bool) memberActive;
    address[] memberAddress;
    address authorized;
  }

  event MemberRole(uint256 indexed roleId, bytes32 roleName, string roleDescription);

  event switchedMembership(address indexed previousMember, address indexed newMember, uint timeStamp);

  event ClaimPayoutAddressSet(address indexed member, address indexed payoutAddress);

  MemberRoleDetails[] internal memberRoleData;
  bool internal constructorCheck;
  uint public maxABCount;
  bool public launched;
  uint public launchedOn;

  mapping (address => address payable) internal claimPayoutAddress;

  modifier checkRoleAuthority(uint _memberRoleId) {
    if (memberRoleData[_memberRoleId].authorized != address(0))
      require(msg.sender == memberRoleData[_memberRoleId].authorized);
    else
      require(isAuthorizedToGovern(msg.sender), "Not Authorized");
    _;
  }

  /**
   * @dev to swap advisory board member
   * @param _newABAddress is address of new AB member
   * @param _removeAB is advisory board member to be removed
   */
  function swapABMember(
    address _newABAddress,
    address _removeAB
  )
  external
  checkRoleAuthority(uint(Role.AdvisoryBoard)) {

    _updateRole(_newABAddress, uint(Role.AdvisoryBoard), true);
    _updateRole(_removeAB, uint(Role.AdvisoryBoard), false);

  }

  /**
   * @dev to swap the owner address
   * @param _newOwnerAddress is the new owner address
   */
  function swapOwner(
    address _newOwnerAddress
  )
  external {
    require(msg.sender == address(ms));
    _updateRole(ms.owner(), uint(Role.Owner), false);
    _updateRole(_newOwnerAddress, uint(Role.Owner), true);
  }

  /**
   * @dev is used to add initital advisory board members
   * @param abArray is the list of initial advisory board members
   */
  function addInitialABMembers(address[] calldata abArray) external onlyOwner {

    //Ensure that NXMaster has initialized.
    require(ms.masterInitialized());

    require(maxABCount >=
      SafeMath.add(numberOfMembers(uint(Role.AdvisoryBoard)), abArray.length)
    );
    //AB count can't exceed maxABCount
    for (uint i = 0; i < abArray.length; i++) {
      require(checkRole(abArray[i], uint(Role.Member)));
      _updateRole(abArray[i], uint(Role.AdvisoryBoard), true);
    }
  }

  /**
   * @dev to change max number of AB members allowed
   * @param _val is the new value to be set
   */
  function changeMaxABCount(uint _val) external onlyInternal {
    maxABCount = _val;
  }

  /**
   * @dev Iupgradable Interface to update dependent contract address
   */
  function changeDependentContractAddress() public {
    td = ITokenData(ms.getLatestAddress("TD"));
    cr = IClaimsReward(ms.getLatestAddress("CR"));
    qd = IQuotationData(ms.getLatestAddress("QD"));
    gv = IGovernance(ms.getLatestAddress("GV"));
    tf = ITokenFunctions(ms.getLatestAddress("TF"));
    tk = INXMToken(ms.tokenAddress());
    tc = ITokenController(ms.getLatestAddress("TC"));
  }

  /**
   * @dev to change the master address
   * @param _masterAddress is the new master address
   */
  function changeMasterAddress(address _masterAddress) public {

    if (masterAddress != address(0)) {
      require(masterAddress == msg.sender);
    }

    masterAddress = _masterAddress;
    ms = INXMMaster(_masterAddress);
    nxMasterAddress = _masterAddress;
  }

  /**
   * @dev to initiate the member roles
   * @param _firstAB is the address of the first AB member
   * @param memberAuthority is the authority (role) of the member
   */
  function memberRolesInitiate(address _firstAB, address memberAuthority) public {
    require(!constructorCheck);
    _addInitialMemberRoles(_firstAB, memberAuthority);
    constructorCheck = true;
  }

  /// @dev Adds new member role
  /// @param _roleName New role name
  /// @param _roleDescription New description hash
  /// @param _authorized Authorized member against every role id
  function addRole(//solhint-disable-line
    bytes32 _roleName,
    string memory _roleDescription,
    address _authorized
  )
  public
  onlyAuthorizedToGovern {
    _addRole(_roleName, _roleDescription, _authorized);
  }

  /// @dev Assign or Delete a member from specific role.
  /// @param _memberAddress Address of Member
  /// @param _roleId RoleId to update
  /// @param _active active is set to be True if we want to assign this role to member, False otherwise!
  function updateRole(//solhint-disable-line
    address _memberAddress,
    uint _roleId,
    bool _active
  )
  public
  checkRoleAuthority(_roleId) {
    _updateRole(_memberAddress, _roleId, _active);
  }

  /**
   * @dev to add members before launch
   * @param userArray is list of addresses of members
   * @param tokens is list of tokens minted for each array element
   */
  function addMembersBeforeLaunch(address[] memory userArray, uint[] memory tokens) public onlyOwner {
    require(!launched);

    for (uint i = 0; i < userArray.length; i++) {
      require(!ms.isMember(userArray[i]));
      tc.addToWhitelist(userArray[i]);
      _updateRole(userArray[i], uint(Role.Member), true);
      tc.mint(userArray[i], tokens[i]);
    }
    launched = true;
    launchedOn = now;

  }

  /**
    * @dev Called by user to pay joining membership fee
    */
  function payJoiningFee(address _userAddress) public payable {
    require(_userAddress != address(0));
    require(!ms.isPause(), "Emergency Pause Applied");
    if (msg.sender == address(ms.getLatestAddress("QT"))) {
      require(td.walletAddress() != address(0), "No walletAddress present");
      tc.addToWhitelist(_userAddress);
      _updateRole(_userAddress, uint(Role.Member), true);
      td.walletAddress().transfer(msg.value);
    } else {
      require(!qd.refundEligible(_userAddress));
      require(!ms.isMember(_userAddress));
      require(msg.value == td.joiningFee());
      qd.setRefundEligible(_userAddress, true);
    }
  }

  /**
   * @dev to perform kyc verdict
   * @param _userAddress whose kyc is being performed
   * @param verdict of kyc process
   */
  function kycVerdict(address payable _userAddress, bool verdict) public {

    require(msg.sender == qd.kycAuthAddress());
    require(!ms.isPause());
    require(_userAddress != address(0));
    require(!ms.isMember(_userAddress));
    require(qd.refundEligible(_userAddress));
    if (verdict) {
      qd.setRefundEligible(_userAddress, false);
      uint fee = td.joiningFee();
      tc.addToWhitelist(_userAddress);
      _updateRole(_userAddress, uint(Role.Member), true);
      td.walletAddress().transfer(fee); // solhint-disable-line

    } else {
      qd.setRefundEligible(_userAddress, false);
      _userAddress.transfer(td.joiningFee()); // solhint-disable-line
    }
  }

  /**
   * @dev withdraws membership for msg.sender if currently a member.
   */
  function withdrawMembership() public {

    require(!ms.isPause() && ms.isMember(msg.sender));
    require(tc.totalLockedBalance(msg.sender) == 0); // solhint-disable-line
    require(!tf.isLockedForMemberVote(msg.sender)); // No locked tokens for Member/Governance voting
    require(cr.getAllPendingRewardOfUser(msg.sender) == 0); // No pending reward to be claimed(claim assesment).

    gv.removeDelegation(msg.sender);
    tc.burnFrom(msg.sender, tk.balanceOf(msg.sender));
    _updateRole(msg.sender, uint(Role.Member), false);
    tc.removeFromWhitelist(msg.sender); // need clarification on whitelist

    if (claimPayoutAddress[msg.sender] != address(0)) {
      claimPayoutAddress[msg.sender] = address(0);
      emit ClaimPayoutAddressSet(msg.sender, address(0));
    }
  }

  /**
   * @dev switches membership for msg.sender to the specified address.
   * @param newAddress address of user to forward membership.
   */
  function switchMembership(address newAddress) external {
    _switchMembership(msg.sender, newAddress);
    tk.transferFrom(msg.sender, newAddress, tk.balanceOf(msg.sender));
  }

  function switchMembershipOf(address member, address newAddress) external onlyInternal {
    _switchMembership(member, newAddress);
  }

  /**
   * @dev switches membership for member to the specified address.
   * @param newAddress address of user to forward membership.
   */
  function _switchMembership(address member, address newAddress) internal {

    require(!ms.isPause() && ms.isMember(member) && !ms.isMember(newAddress));
    require(tc.totalLockedBalance(member) == 0); // solhint-disable-line
    require(!tf.isLockedForMemberVote(member)); // No locked tokens for Member/Governance voting
    require(cr.getAllPendingRewardOfUser(member) == 0); // No pending reward to be claimed(claim assesment).

    gv.removeDelegation(member);
    tc.addToWhitelist(newAddress);
    _updateRole(newAddress, uint(Role.Member), true);
    _updateRole(member, uint(Role.Member), false);
    tc.removeFromWhitelist(member);

    address payable previousPayoutAddress = claimPayoutAddress[member];

    if (previousPayoutAddress != address(0)) {

      address payable storedAddress = previousPayoutAddress == newAddress ? address(0) : previousPayoutAddress;

      claimPayoutAddress[member] = address(0);
      claimPayoutAddress[newAddress] = storedAddress;

      // emit event for old address reset
      emit ClaimPayoutAddressSet(member, address(0));

      if (storedAddress != address(0)) {
        // emit event for setting the payout address on the new member address if it's non zero
        emit ClaimPayoutAddressSet(newAddress, storedAddress);
      }
    }

    emit switchedMembership(member, newAddress, now);
  }

  function getClaimPayoutAddress(address payable _member) external view returns (address payable) {
    address payable payoutAddress = claimPayoutAddress[_member];
    return payoutAddress != address(0) ? payoutAddress : _member;
  }

  function setClaimPayoutAddress(address payable _address) external {

    require(!ms.isPause(), "system is paused");
    require(ms.isMember(msg.sender), "sender is not a member");
    require(_address != msg.sender, "should be different than the member address");

    claimPayoutAddress[msg.sender] = _address;
    emit ClaimPayoutAddressSet(msg.sender, _address);
  }

  /// @dev Return number of member roles
  function totalRoles() public view returns (uint256) {//solhint-disable-line
    return memberRoleData.length;
  }

  /// @dev Change Member Address who holds the authority to Add/Delete any member from specific role.
  /// @param _roleId roleId to update its Authorized Address
  /// @param _newAuthorized New authorized address against role id
  function changeAuthorized(uint _roleId, address _newAuthorized) public checkRoleAuthority(_roleId) {//solhint-disable-line
    memberRoleData[_roleId].authorized = _newAuthorized;
  }

  /// @dev Gets the member addresses assigned by a specific role
  /// @param _memberRoleId Member role id
  /// @return roleId Role id
  /// @return allMemberAddress Member addresses of specified role id
  function members(uint _memberRoleId) public view returns (uint, address[] memory memberArray) {//solhint-disable-line
    uint length = memberRoleData[_memberRoleId].memberAddress.length;
    uint i;
    uint j = 0;
    memberArray = new address[](memberRoleData[_memberRoleId].memberCounter);
    for (i = 0; i < length; i++) {
      address member = memberRoleData[_memberRoleId].memberAddress[i];
      if (memberRoleData[_memberRoleId].memberActive[member] && !_checkMemberInArray(member, memberArray)) {//solhint-disable-line
        memberArray[j] = member;
        j++;
      }
    }

    return (_memberRoleId, memberArray);
  }

  /// @dev Gets all members' length
  /// @param _memberRoleId Member role id
  /// @return memberRoleData[_memberRoleId].memberCounter Member length
  function numberOfMembers(uint _memberRoleId) public view returns (uint) {//solhint-disable-line
    return memberRoleData[_memberRoleId].memberCounter;
  }

  /// @dev Return member address who holds the right to add/remove any member from specific role.
  function authorized(uint _memberRoleId) public view returns (address) {//solhint-disable-line
    return memberRoleData[_memberRoleId].authorized;
  }

  /// @dev Get All role ids array that has been assigned to a member so far.
  function roles(address _memberAddress) public view returns (uint[] memory) {//solhint-disable-line
    uint length = memberRoleData.length;
    uint[] memory assignedRoles = new uint[](length);
    uint counter = 0;
    for (uint i = 1; i < length; i++) {
      if (memberRoleData[i].memberActive[_memberAddress]) {
        assignedRoles[counter] = i;
        counter++;
      }
    }
    return assignedRoles;
  }

  /// @dev Returns true if the given role id is assigned to a member.
  /// @param _memberAddress Address of member
  /// @param _roleId Checks member's authenticity with the roleId.
  /// i.e. Returns true if this roleId is assigned to member
  function checkRole(address _memberAddress, uint _roleId) public view returns (bool) {//solhint-disable-line
    if (_roleId == uint(Role.UnAssigned))
      return true;
    else
      if (memberRoleData[_roleId].memberActive[_memberAddress]) //solhint-disable-line
        return true;
      else
        return false;
  }

  /// @dev Return total number of members assigned against each role id.
  /// @return totalMembers Total members in particular role id
  function getMemberLengthForAllRoles() public view returns (uint[] memory totalMembers) {//solhint-disable-line
    totalMembers = new uint[](memberRoleData.length);
    for (uint i = 0; i < memberRoleData.length; i++) {
      totalMembers[i] = numberOfMembers(i);
    }
  }

  /**
   * @dev to update the member roles
   * @param _memberAddress in concern
   * @param _roleId the id of role
   * @param _active if active is true, add the member, else remove it
   */
  function _updateRole(address _memberAddress,
    uint _roleId,
    bool _active) internal {
    // require(_roleId != uint(Role.TokenHolder), "Membership to Token holder is detected automatically");
    if (_active) {
      require(!memberRoleData[_roleId].memberActive[_memberAddress]);
      memberRoleData[_roleId].memberCounter = SafeMath.add(memberRoleData[_roleId].memberCounter, 1);
      memberRoleData[_roleId].memberActive[_memberAddress] = true;
      memberRoleData[_roleId].memberAddress.push(_memberAddress);
    } else {
      require(memberRoleData[_roleId].memberActive[_memberAddress]);
      memberRoleData[_roleId].memberCounter = SafeMath.sub(memberRoleData[_roleId].memberCounter, 1);
      delete memberRoleData[_roleId].memberActive[_memberAddress];
    }
  }

  /// @dev Adds new member role
  /// @param _roleName New role name
  /// @param _roleDescription New description hash
  /// @param _authorized Authorized member against every role id
  function _addRole(
    bytes32 _roleName,
    string memory _roleDescription,
    address _authorized
  ) internal {
    emit MemberRole(memberRoleData.length, _roleName, _roleDescription);
    memberRoleData.push(MemberRoleDetails(0, new address[](0), _authorized));
  }

  /**
   * @dev to check if member is in the given member array
   * @param _memberAddress in concern
   * @param memberArray in concern
   * @return boolean to represent the presence
   */
  function _checkMemberInArray(
    address _memberAddress,
    address[] memory memberArray
  )
  internal
  pure
  returns (bool memberExists)
  {
    uint i;
    for (i = 0; i < memberArray.length; i++) {
      if (memberArray[i] == _memberAddress) {
        memberExists = true;
        break;
      }
    }
  }

  /**
   * @dev to add initial member roles
   * @param _firstAB is the member address to be added
   * @param memberAuthority is the member authority(role) to be added for
   */
  function _addInitialMemberRoles(address _firstAB, address memberAuthority) internal {
    maxABCount = 5;
    _addRole("Unassigned", "Unassigned", address(0));
    _addRole(
      "Advisory Board",
      "Selected few members that are deeply entrusted by the dApp. An ideal advisory board should be a mix of skills of domain, governance, research, technology, consulting etc to improve the performance of the dApp.", //solhint-disable-line
      address(0)
    );
    _addRole(
      "Member",
      "Represents all users of Mutual.", //solhint-disable-line
      memberAuthority
    );
    _addRole(
      "Owner",
      "Represents Owner of Mutual.", //solhint-disable-line
      address(0)
    );
    // _updateRole(_firstAB, uint(Role.AdvisoryBoard), true);
    _updateRole(_firstAB, uint(Role.Owner), true);
    // _updateRole(_firstAB, uint(Role.Member), true);
    launchedOn = 0;
  }

  function memberAtIndex(uint _memberRoleId, uint index) external view returns (address, bool) {
    address memberAddress = memberRoleData[_memberRoleId].memberAddress[index];
    return (memberAddress, memberRoleData[_memberRoleId].memberActive[memberAddress]);
  }

  function membersLength(uint _memberRoleId) external view returns (uint) {
    return memberRoleData[_memberRoleId].memberAddress.length;
  }
}
