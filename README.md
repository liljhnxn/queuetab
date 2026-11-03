# QueueTab 🧾⚡

**QueueTab** is an on-chain group expense tracking application built on the **Botchain Testnet**. It helps friends, roommates, and small travel groups record shared expenses, manage group members, and automatically calculate fair individual liabilities and net balances directly on the blockchain.

> [!NOTE]
> **Strictly an Accounting Ledger:** QueueTab records shared expenses and mathematically divides liabilities among members on-chain. It **does NOT** transfer cryptocurrency, hold funds, request payment approvals, or process transactions through payment gateways.

---

## 🌟 Key Features

### 🦊 Wallet Connection & Network Management
- One-click **MetaMask** and injected wallet integration via **wagmi v2** and **viem**.
- Real-time network detection with a 1-click **"Switch to Botchain"** prompt if connected to an unsupported chain.
- Shortened wallet address formatting (`0x12...34`) with instant clipboard copying.
- Graceful wallet disconnection and session handling.

### 👥 Group Creation & Administration
- Create groups with a custom name and description.
- The creator automatically becomes the **Group Administrator** and first member.
- Sequential, verifiable on-chain group IDs.
- Admin-only member invitation with address validation (prevents duplicate members, invalid addresses, and the zero address).

### 📝 Expense Recording & Integer-Safe Arithmetic
- Any registered member can record shared expenses (in BOHR).
- Real-time equal split calculation preview: `Share per member = Amount / MemberCount`.
- **Rounding Handling**: All calculations use integer-safe arithmetic. When dividing `amount` by `N` members, each member's liability increments by `amount / N`. Any indivisible wei remainder (`amount % N`) remains tracked with the expense record to prevent precision loss.
- Immutable activity log storing the payer's address, expense title, description, timestamp, and split per member.

### 📊 Transparent Balance Summary
- Automatically calculates:
  - **Total Paid:** Total BOHR contributed by each member toward group expenses.
  - **Share Owed:** Total BOHR share of all recorded group expenses.
  - **Net Balance:** Calculated as `Net Balance = Amount Paid − Share Owed`.
- Visual balance interpretation:
  - 🟢 **Positive (+):** Member has paid more than their share (owed credit).
  - 🔴 **Negative (−):** Member still owes money to the group.
  - ⚪ **Zero (0.00):** Contributions exactly match their share (settled).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 14 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom charcoal theme) |
| **Web3 Libraries** | [wagmi v2](https://wagmi.sh/), [viem](https://viem.sh/), [@tanstack/react-query](https://tanstack.com/query) |
| **Smart Contract** | [Solidity ^0.8.20](https://soliditylang.org/) (`QueueTab.sol`) |
| **Development & Testing** | [Hardhat](https://hardhat.org/) (`@nomicfoundation/hardhat-toolbox`) |

---

## 🌐 Blockchain Configuration (Botchain Testnet)

| Parameter | Value |
|---|---|
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |
| **Native Currency** | BOHR (18 decimals) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, or v22 LTS recommended)
- [MetaMask](https://metamask.io/) browser extension

### 1. Installation

Clone or open the repository, then install dependencies:

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your configuration:

```env
# Botchain Testnet RPC
BOTCHAIN_RPC_URL="https://rpc.bohr.life"

# Deployer Private Key (For contract deployment)
PRIVATE_KEY="your_private_key_without_0x"

# Deployed Smart Contract Address (Updated after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."

# Network Configuration
NEXT_PUBLIC_CHAIN_ID="968"
NEXT_PUBLIC_RPC_URL="https://rpc.bohr.life"
NEXT_PUBLIC_BLOCK_EXPLORER_URL="https://scan.bohr.life"
NEXT_PUBLIC_CURRENCY_SYMBOL="BOHR"
```

---

## 🧪 Smart Contract Testing

QueueTab comes with a comprehensive suite of 18 automated tests covering:
- Group creation and admin assignment
- Member addition and duplicate / zero address validation
- Expense recording permissions and equal distribution
- Multi-member balance calculations and net settlement
- Integer division rounding remainder behavior
- Reversion guards for non-existent groups

Run the tests with:

```bash
npm run test
```

Expected output:
```text
  QueueTab Smart Contract
    Group Creation
      ✔ should successfully create a new group with creator as admin and first member
      ✔ should reject group creation with empty name
      ✔ should increment group counter across multiple creations
    Group Information Updates
      ✔ should allow group admin to update group information
      ✔ should prevent non-admin from updating group information
      ✔ should reject empty group name during update
    Member Management
      ✔ should allow admin to add members
      ✔ should prevent non-admin from adding members
      ✔ should reject duplicate members
      ✔ should reject zero address member
    Expense Recording & Equal Distribution
      ✔ should allow registered members to record expenses
      ✔ should reject expense submission from non-members
      ✔ should reject expense with empty title
      ✔ should reject expense with zero amount
    Balance Calculations & Net Balance Formula
      ✔ should correctly compute individual balances when one member pays
      ✔ should correctly calculate balances with multiple expenses from different members
      ✔ should properly handle integer division rounding remainder
    Query Non-Existent Groups
      ✔ should revert when querying non-existent group

  18 passing
```

---

## 🚢 Deploying to Botchain Testnet

1. Ensure your deployer account has testnet BOHR tokens.
2. Run the deployment script:

```bash
npm run deploy:botchain
```

3. The script will output the deployed contract address and automatically save the deployment information to `src/config/contractAddress.json`.
4. Copy the contract address into your `.env` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

---

## 💻 Running the Frontend

### Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build:
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
QueueTab/
├── contracts/
│   └── QueueTab.sol             # Core expense tracking smart contract
├── scripts/
│   └── deploy.ts                # Hardhat deployment script
├── test/
│   └── QueueTab.test.ts         # Comprehensive Chai/Mocha test suite
├── src/
│   ├── app/
│   │   ├── globals.css          # Dark charcoal theme styling
│   │   ├── layout.tsx           # Web3Provider + Navbar + Footer layout
│   │   ├── page.tsx             # Main dashboard & group listings
│   │   └── group/[id]/page.tsx  # Group details, expenses & balance summary
│   ├── components/
│   │   ├── AddMemberModal.tsx   # Modal for admin to add wallet members
│   │   ├── BalanceSummary.tsx   # Transparent member balance table
│   │   ├── CreateGroupModal.tsx # Group creation dialog
│   │   ├── ExpenseList.tsx      # Chronological expense history feed
│   │   ├── GroupCard.tsx        # Dashboard group overview card
│   │   ├── Navbar.tsx           # MetaMask connection & network switcher
│   │   ├── NoticeBanner.tsx     # Non-payment ledger disclaimer
│   │   └── OverviewStats.tsx    # Global metric counters
│   ├── config/
│   │   ├── abi.ts               # Complete typed QueueTab ABI
│   │   ├── contract.ts          # Contract address & wagmi contract config
│   │   ├── network.ts           # Botchain Testnet chain definition
│   │   └── wagmi.ts             # Wagmi client configuration
│   ├── providers/
│   │   └── Web3Provider.tsx     # Wagmi & React Query provider wrapper
│   └── utils/
│       └── format.ts            # Wei/Ether formatting, address shortening
├── hardhat.config.ts            # Hardhat configuration with viaIR & Botchain RPC
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

---

## 📄 License
MIT License.

