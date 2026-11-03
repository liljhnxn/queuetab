export const QUEUETAB_ABI = [
  {
    type: "function",
    name: "createGroup",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "updateGroup",
    stateMutability: "nonpayable",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "name", type: "string" },
      { name: "description", type: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "addMember",
    stateMutability: "nonpayable",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "member", type: "address" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "recordExpense",
    stateMutability: "nonpayable",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getGroupCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getTotalExpenseCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getGroup",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "admin", type: "address" },
      { name: "createdAt", type: "uint256" },
      { name: "totalSpending", type: "uint256" },
      { name: "memberCount", type: "uint256" },
      { name: "expenseCount", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "getGroupMembers",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    type: "function",
    name: "isGroupMember",
    stateMutability: "view",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "account", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "getExpenses",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "groupId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "recordedBy", type: "address" },
          { name: "timestamp", type: "uint256" },
          { name: "memberCountAtRecording", type: "uint256" },
          { name: "splitAmountPerMember", type: "uint256" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getExpenseCount",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getMemberBalance",
    stateMutability: "view",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "member", type: "address" }
    ],
    outputs: [
      { name: "totalPaid", type: "uint256" },
      { name: "totalShareOwed", type: "uint256" },
      { name: "netBalance", type: "int256" }
    ]
  },
  {
    type: "function",
    name: "getGroupBalances",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "uint256" }],
    outputs: [
      { name: "members", type: "address[]" },
      { name: "amountsPaid", type: "uint256[]" },
      { name: "sharesOwed", type: "uint256[]" },
      { name: "netBalances", type: "int256[]" }
    ]
  },
  {
    type: "function",
    name: "getUserGroups",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }]
  },
  {
    type: "event",
    name: "GroupCreated",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "admin", type: "address", indexed: true },
      { name: "createdAt", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "MemberAdded",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "member", type: "address", indexed: true },
      { name: "addedBy", type: "address", indexed: true }
    ]
  },
  {
    type: "event",
    name: "ExpenseRecorded",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "expenseId", type: "uint256", indexed: true },
      { name: "recordedBy", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "splitPerMember", type: "uint256", indexed: false },
      { name: "title", type: "string", indexed: false }
    ]
  },
  {
    type: "event",
    name: "GroupUpdated",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "description", type: "string", indexed: false },
      { name: "updatedBy", type: "address", indexed: true }
    ]
  }
] as const;

