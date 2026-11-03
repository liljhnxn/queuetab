// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QueueTab
 * @dev On-chain group expense tracking smart contract.
 * Records shared expenses, member participation, and tracks balances without processing payments.
 * 
 * Rounding & Arithmetic:
 * All math operations are strictly integer-safe. When an expense of `amount` is recorded
 * for a group of `N` members, each current member's liability is increased by `amount / N`.
 * Any indivisible remainder (`amount % N` wei) is retained in the expense log without
 * inflating any member's liability, preventing fractional wei precision loss.
 */
contract QueueTab {
    // --- STRUCTS ---

    struct Group {
        uint256 id;
        string name;
        string description;
        address admin;
        uint256 createdAt;
        uint256 totalSpending;
        bool exists;
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

    // --- STATE VARIABLES ---

    uint256 private _groupCounter;
    uint256 private _totalExpenseCounter;

    // groupId => Group
    mapping(uint256 => Group) private _groups;

    // groupId => list of member addresses
    mapping(uint256 => address[]) private _groupMembers;

    // groupId => member address => isMember
    mapping(uint256 => mapping(address => bool)) private _isMember;

    // groupId => list of Expenses
    mapping(uint256 => Expense[]) private _groupExpenses;

    // groupId => member address => total contributed / paid
    mapping(uint256 => mapping(address => uint256)) private _memberPaid;

    // groupId => member address => total share owed
    mapping(uint256 => mapping(address => uint256)) private _memberOwed;

    // user address => list of group IDs
    mapping(address => uint256[]) private _userGroups;

    // user address => groupId => isTrackedInUserGroups
    mapping(address => mapping(uint256 => bool)) private _userHasGroup;

    // --- EVENTS ---

    event GroupCreated(
        uint256 indexed groupId,
        string name,
        address indexed admin,
        uint256 createdAt
    );

    event MemberAdded(
        uint256 indexed groupId,
        address indexed member,
        address indexed addedBy
    );

    event ExpenseRecorded(
        uint256 indexed groupId,
        uint256 indexed expenseId,
        address indexed recordedBy,
        uint256 amount,
        uint256 splitPerMember,
        string title
    );

    event GroupUpdated(
        uint256 indexed groupId,
        string name,
        string description,
        address indexed updatedBy
    );

    // --- CUSTOM ERRORS ---

    error GroupNotFound(uint256 groupId);
    error NotGroupAdmin(uint256 groupId, address caller);
    error NotGroupMember(uint256 groupId, address caller);
    error InvalidAddress();
    error MemberAlreadyExists(uint256 groupId, address member);
    error EmptyGroupName();
    error EmptyExpenseTitle();
    error InvalidExpenseAmount();

    // --- MODIFIERS ---

    modifier onlyExistingGroup(uint256 groupId) {
        if (!_groups[groupId].exists) {
            revert GroupNotFound(groupId);
        }
        _;
    }

    modifier onlyAdmin(uint256 groupId) {
        if (_groups[groupId].admin != msg.sender) {
            revert NotGroupAdmin(groupId, msg.sender);
        }
        _;
    }

    modifier onlyMember(uint256 groupId) {
        if (!_isMember[groupId][msg.sender]) {
            revert NotGroupMember(groupId, msg.sender);
        }
        _;
    }

    // --- EXTERNAL FUNCTIONS ---

    /**
     * @notice Creates a new expense group.
     * @param name Name of the group.
     * @param description Optional short description.
     * @return groupId The unique identifier of the created group.
     */
    function createGroup(
        string calldata name,
        string calldata description
    ) external returns (uint256) {
        if (bytes(name).length == 0) {
            revert EmptyGroupName();
        }

        _groupCounter++;
        uint256 newGroupId = _groupCounter;

        Group storage group = _groups[newGroupId];
        group.id = newGroupId;
        group.name = name;
        group.description = description;
        group.admin = msg.sender;
        group.createdAt = block.timestamp;
        group.totalSpending = 0;
        group.exists = true;

        // Admin is automatically the first member
        _groupMembers[newGroupId].push(msg.sender);
        _isMember[newGroupId][msg.sender] = true;

        _addMemberToUserGroups(msg.sender, newGroupId);

        emit GroupCreated(newGroupId, name, msg.sender, block.timestamp);
        emit MemberAdded(newGroupId, msg.sender, msg.sender);

        return newGroupId;
    }

    /**
     * @notice Updates group name and description.
     * @dev Only the group administrator can perform this action.
     */
    function updateGroup(
        uint256 groupId,
        string calldata name,
        string calldata description
    ) external onlyExistingGroup(groupId) onlyAdmin(groupId) {
        if (bytes(name).length == 0) {
            revert EmptyGroupName();
        }

        Group storage group = _groups[groupId];
        group.name = name;
        group.description = description;

        emit GroupUpdated(groupId, name, description, msg.sender);
    }

    /**
     * @notice Adds a new member to an existing group.
     * @dev Only the group administrator can add members.
     * @param groupId Group identifier.
     * @param member Wallet address of the member to add.
     */
    function addMember(
        uint256 groupId,
        address member
    ) external onlyExistingGroup(groupId) onlyAdmin(groupId) {
        if (member == address(0)) {
            revert InvalidAddress();
        }
        if (_isMember[groupId][member]) {
            revert MemberAlreadyExists(groupId, member);
        }

        _groupMembers[groupId].push(member);
        _isMember[groupId][member] = true;

        _addMemberToUserGroups(member, groupId);

        emit MemberAdded(groupId, member, msg.sender);
    }

    /**
     * @notice Records a new shared expense for the group.
     * @dev Only active members can record expenses.
     * The expense amount is divided equally among all current group members.
     * Remainder `amount % memberCount` is logged without fractional wei precision errors.
     * @param groupId Group identifier.
     * @param title Title/label of the expense.
     * @param description Optional description or breakdown notes.
     * @param amount Expense amount (in wei).
     */
    function recordExpense(
        uint256 groupId,
        string calldata title,
        string calldata description,
        uint256 amount
    ) external onlyExistingGroup(groupId) onlyMember(groupId) {
        if (bytes(title).length == 0) {
            revert EmptyExpenseTitle();
        }
        if (amount == 0) {
            revert InvalidExpenseAmount();
        }

        uint256 memberCount = _groupMembers[groupId].length;
        assert(memberCount > 0);

        uint256 splitAmount = amount / memberCount;

        // Distribute share liability to every current group member
        for (uint256 i = 0; i < memberCount; i++) {
            _memberOwed[groupId][_groupMembers[groupId][i]] += splitAmount;
        }

        // Credit the recording member with paying the full expense amount
        _memberPaid[groupId][msg.sender] += amount;

        // Update group total spending
        _groups[groupId].totalSpending += amount;

        _totalExpenseCounter++;
        uint256 expenseId = _totalExpenseCounter;

        _groupExpenses[groupId].push(
            Expense({
                id: expenseId,
                groupId: groupId,
                title: title,
                description: description,
                amount: amount,
                recordedBy: msg.sender,
                timestamp: block.timestamp,
                memberCountAtRecording: memberCount,
                splitAmountPerMember: splitAmount
            })
        );

        emit ExpenseRecorded(
            groupId,
            expenseId,
            msg.sender,
            amount,
            splitAmount,
            title
        );
    }

    // --- VIEW / READ FUNCTIONS ---

    /**
     * @notice Total number of groups created.
     */
    function getGroupCount() external view returns (uint256) {
        return _groupCounter;
    }

    /**
     * @notice Total number of expenses recorded across all groups.
     */
    function getTotalExpenseCount() external view returns (uint256) {
        return _totalExpenseCounter;
    }

    /**
     * @notice Retrieve group details.
     */
    function getGroup(uint256 groupId)
        external
        view
        onlyExistingGroup(groupId)
        returns (
            uint256 id,
            string memory name,
            string memory description,
            address admin,
            uint256 createdAt,
            uint256 totalSpending,
            uint256 memberCount,
            uint256 expenseCount
        )
    {
        Group storage group = _groups[groupId];
        return (
            group.id,
            group.name,
            group.description,
            group.admin,
            group.createdAt,
            group.totalSpending,
            _groupMembers[groupId].length,
            _groupExpenses[groupId].length
        );
    }

    /**
     * @notice Returns all member addresses of a group.
     */
    function getGroupMembers(uint256 groupId)
        external
        view
        onlyExistingGroup(groupId)
        returns (address[] memory)
    {
        return _groupMembers[groupId];
    }

    /**
     * @notice Check whether an address is a member of a group.
     */
    function isGroupMember(uint256 groupId, address account)
        external
        view
        onlyExistingGroup(groupId)
        returns (bool)
    {
        return _isMember[groupId][account];
    }

    /**
     * @notice Retrieve all expenses for a group.
     */
    function getExpenses(uint256 groupId)
        external
        view
        onlyExistingGroup(groupId)
        returns (Expense[] memory)
    {
        return _groupExpenses[groupId];
    }

    /**
     * @notice Retrieve total expense count for a group.
     */
    function getExpenseCount(uint256 groupId)
        external
        view
        onlyExistingGroup(groupId)
        returns (uint256)
    {
        return _groupExpenses[groupId].length;
    }

    /**
     * @notice Calculates a member's financial metrics in a group.
     * @dev Net balance = Amount paid - Share owed.
     * Positive = Member has paid more than their share (owed a refund/credit).
     * Negative = Member has paid less than their share (owes money).
     * Zero = Member is exactly settled.
     */
    function getMemberBalance(uint256 groupId, address member)
        external
        view
        onlyExistingGroup(groupId)
        returns (
            uint256 totalPaid,
            uint256 totalShareOwed,
            int256 netBalance
        )
    {
        totalPaid = _memberPaid[groupId][member];
        totalShareOwed = _memberOwed[groupId][member];
        netBalance = int256(totalPaid) - int256(totalShareOwed);
    }

    /**
     * @notice Batch fetch balance information for all members in a group.
     */
    function getGroupBalances(uint256 groupId)
        external
        view
        onlyExistingGroup(groupId)
        returns (
            address[] memory members,
            uint256[] memory amountsPaid,
            uint256[] memory sharesOwed,
            int256[] memory netBalances
        )
    {
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

    /**
     * @notice Returns all group IDs that a user is part of.
     */
    function getUserGroups(address user)
        external
        view
        returns (uint256[] memory)
    {
        return _userGroups[user];
    }

    // --- INTERNAL HELPER ---

    function _addMemberToUserGroups(address user, uint256 groupId) internal {
        if (!_userHasGroup[user][groupId]) {
            _userHasGroup[user][groupId] = true;
            _userGroups[user].push(groupId);
        }
    }
}
