// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QueueTab
 * @dev Optimized on-chain group expense tracking smart contract.
 * Strictly non-custodial: records shared liabilities and balances without processing payments.
 */
contract QueueTab {
    struct Group {
        uint256 id;
        string name;
        string description;
        address admin;
        uint256 createdAt;
        uint256 totalSpending;
        uint256 memberCount;
        uint256 expenseCount;
    }

    struct Expense {
        uint256 id;
        uint256 groupId;
        string title;
        string description;
        uint256 amount;
        address recordedBy;
        uint256 timestamp;
        uint256 memberCountAtRecording;
        uint256 splitAmountPerMember;
    }

    uint256 private _groupCounter;
    uint256 private _totalExpenseCounter;

    mapping(uint256 => Group) private _groups;
    mapping(uint256 => address[]) private _groupMembers;
    mapping(uint256 => mapping(address => bool)) private _isMember;
    mapping(uint256 => Expense[]) private _groupExpenses;
    mapping(uint256 => mapping(address => uint256)) private _memberPaid;
    mapping(uint256 => mapping(address => uint256)) private _memberOwed;
    mapping(address => uint256[]) private _userGroups;
    mapping(address => mapping(uint256 => bool)) private _userHasGroup;

    event GroupCreated(uint256 indexed groupId, string name, address indexed admin, uint256 createdAt);
    event MemberAdded(uint256 indexed groupId, address indexed member, address indexed addedBy);
    event ExpenseRecorded(uint256 indexed groupId, uint256 indexed expenseId, address indexed recordedBy, uint256 amount, uint256 splitPerMember, string title);
    event GroupUpdated(uint256 indexed groupId, string name, string description, address indexed updatedBy);

    error GroupNotFound(uint256 groupId);
    error NotGroupAdmin(uint256 groupId, address caller);
    error NotGroupMember(uint256 groupId, address caller);
    error InvalidAddress();
    error MemberAlreadyExists(uint256 groupId, address member);
    error EmptyGroupName();
    error EmptyExpenseTitle();
    error InvalidExpenseAmount();

    modifier onlyExistingGroup(uint256 groupId) {
        if (_groups[groupId].createdAt == 0) revert GroupNotFound(groupId);
        _;
    }

    function createGroup(string calldata name, string calldata description) external returns (uint256) {
        if (bytes(name).length == 0) revert EmptyGroupName();

        uint256 newGroupId = ++_groupCounter;
        Group storage group = _groups[newGroupId];
        group.id = newGroupId;
        group.name = name;
        group.description = description;
        group.admin = msg.sender;
        group.createdAt = block.timestamp;
        group.memberCount = 1;

        _groupMembers[newGroupId].push(msg.sender);
        _isMember[newGroupId][msg.sender] = true;
        _addMemberToUserGroups(msg.sender, newGroupId);

        emit GroupCreated(newGroupId, name, msg.sender, block.timestamp);
        emit MemberAdded(newGroupId, msg.sender, msg.sender);
        return newGroupId;
    }

    function updateGroup(uint256 groupId, string calldata name, string calldata description) external onlyExistingGroup(groupId) {
        if (_groups[groupId].admin != msg.sender) revert NotGroupAdmin(groupId, msg.sender);
        if (bytes(name).length == 0) revert EmptyGroupName();

        _groups[groupId].name = name;
        _groups[groupId].description = description;
        emit GroupUpdated(groupId, name, description, msg.sender);
    }

    function addMember(uint256 groupId, address member) external onlyExistingGroup(groupId) {
        if (_groups[groupId].admin != msg.sender) revert NotGroupAdmin(groupId, msg.sender);
        if (member == address(0)) revert InvalidAddress();
        if (_isMember[groupId][member]) revert MemberAlreadyExists(groupId, member);

        _groupMembers[groupId].push(member);
        _isMember[groupId][member] = true;
        _groups[groupId].memberCount++;
        _addMemberToUserGroups(member, groupId);

        emit MemberAdded(groupId, member, msg.sender);
    }

    function recordExpense(
        uint256 groupId,
        string calldata title,
        string calldata description,
        uint256 amount
    ) external onlyExistingGroup(groupId) {
        if (!_isMember[groupId][msg.sender]) revert NotGroupMember(groupId, msg.sender);
        if (bytes(title).length == 0) revert EmptyExpenseTitle();
        if (amount == 0) revert InvalidExpenseAmount();

        address[] storage members = _groupMembers[groupId];
        uint256 mCount = members.length;
        uint256 splitAmount = amount / mCount;

        for (uint256 i = 0; i < mCount; i++) {
            _memberOwed[groupId][members[i]] += splitAmount;
        }

        _memberPaid[groupId][msg.sender] += amount;
        _groups[groupId].totalSpending += amount;
        _groups[groupId].expenseCount++;

        uint256 expenseId = ++_totalExpenseCounter;
        _groupExpenses[groupId].push(Expense({
            id: expenseId,
            groupId: groupId,
            title: title,
            description: description,
            amount: amount,
            recordedBy: msg.sender,
            timestamp: block.timestamp,
            memberCountAtRecording: mCount,
            splitAmountPerMember: splitAmount
        }));

        emit ExpenseRecorded(groupId, expenseId, msg.sender, amount, splitAmount, title);
    }

    function getGroupCount() external view returns (uint256) {
        return _groupCounter;
    }

    function getTotalExpenseCount() external view returns (uint256) {
        return _totalExpenseCounter;
    }

    function getGroup(uint256 groupId) external view onlyExistingGroup(groupId) returns (
        uint256 id,
        string memory name,
        string memory description,
        address admin,
        uint256 createdAt,
        uint256 totalSpending,
        uint256 memberCount,
        uint256 expenseCount
    ) {
        Group storage g = _groups[groupId];
        return (g.id, g.name, g.description, g.admin, g.createdAt, g.totalSpending, g.memberCount, g.expenseCount);
    }

    function getGroupMembers(uint256 groupId) external view onlyExistingGroup(groupId) returns (address[] memory) {
        return _groupMembers[groupId];
    }

    function isGroupMember(uint256 groupId, address account) external view onlyExistingGroup(groupId) returns (bool) {
        return _isMember[groupId][account];
    }

    function getExpenses(uint256 groupId) external view onlyExistingGroup(groupId) returns (Expense[] memory) {
        return _groupExpenses[groupId];
    }

    function getExpenseCount(uint256 groupId) external view onlyExistingGroup(groupId) returns (uint256) {
        return _groups[groupId].expenseCount;
    }

    function getMemberBalance(uint256 groupId, address member) external view onlyExistingGroup(groupId) returns (
        uint256 totalPaid,
        uint256 totalShareOwed,
        int256 netBalance
    ) {
        totalPaid = _memberPaid[groupId][member];
        totalShareOwed = _memberOwed[groupId][member];
        netBalance = int256(totalPaid) - int256(totalShareOwed);
    }

    function getGroupBalances(uint256 groupId) external view onlyExistingGroup(groupId) returns (
        address[] memory members,
        uint256[] memory amountsPaid,
        uint256[] memory sharesOwed,
        int256[] memory netBalances
    ) {
        address[] storage groupMem = _groupMembers[groupId];
        uint256 len = groupMem.length;
        members = groupMem;
        amountsPaid = new uint256[](len);
        sharesOwed = new uint256[](len);
        netBalances = new int256[](len);

        for (uint256 i = 0; i < len; i++) {
            address m = groupMem[i];
            uint256 paid = _memberPaid[groupId][m];
            uint256 owed = _memberOwed[groupId][m];
            amountsPaid[i] = paid;
            sharesOwed[i] = owed;
            netBalances[i] = int256(paid) - int256(owed);
        }
    }

    function getUserGroups(address user) external view returns (uint256[] memory) {
        return _userGroups[user];
    }

    function _addMemberToUserGroups(address user, uint256 groupId) internal {
        if (!_userHasGroup[user][groupId]) {
            _userHasGroup[user][groupId] = true;
            _userGroups[user].push(groupId);
        }
    }
}
