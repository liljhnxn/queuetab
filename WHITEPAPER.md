# QueueTab Whitepaper
**A Non-Custodial, Decentralized Group Expense Tracking Protocol on Botchain**

* **Network:** BOT Chain Mainnet (Chain ID: `677`, Currency: `BOT`)
* **RPC URL:** `https://rpc.botchain.ai`
* **BOT Chain Website:** [https://botchain.ai](https://botchain.ai)
* **BOT Chain Explorer:** [https://scan.botchain.ai](https://scan.botchain.ai)
* **Verified Contract:** [`0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB`](https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB#code)
* **GitHub Repository:** [https://github.com/liljhnxn/queuetab](https://github.com/liljhnxn/queuetab)

---

## 1. Abstract
Managing shared expenses among groups—such as roommates, travel cohorts, and decentralized autonomous organization (DAO) project teams—has historically relied on centralized Web2 applications. These legacy systems are fraught with privacy vulnerabilities, closed databases, intrusive advertisements, and predatory monetization schemes.

QueueTab introduces a trustless, transparent, and non-custodial shared expense tracking protocol implemented as a Solidity smart contract deployed on the BOT Chain Mainnet. Unlike custodial solutions that introduce regulatory friction and counterparty risks by holding user funds in escrow, QueueTab operates strictly as an immutable accounting ledger. It automates equal expense distribution, safely accounts for division remainders at the integer level, and computes net liabilities on-chain without ever custodying user tokens.

---

## 2. Problem Statement

### 2.1 Web2 Centralization & Paywalled Coordination
Mainstream expense-sharing platforms (e.g., Splitwise) have increasingly restricted core features behind aggressive monthly subscription paywalls, introduced invasive behavioral tracking, and left users vulnerable to centralized database corruption or unilateral account suspensions.

### 2.2 Web3 Over-Engineering & Custodial Risks
Existing Web3 expense dApps often conflate *expense bookkeeping* with *payment transfer execution*. By accepting user funds directly into smart contracts, these platforms expose users to:
* **Smart Contract Liquidity Exploits:** Reentrancy attacks, flash loan manipulations, and contract drain vulnerabilities.
* **Approval Hazards:** Requiring unbounded ERC-20 token approvals.
* **Regulatory Complexity:** Acting as money transmitters under custodial frameworks.

### 2.3 Rounding and Truncation Inaccuracies
Standard financial software often relies on floating-point arithmetic or improper integer truncations, leading to precision loss when dividing odd currency amounts across arbitrary group sizes.

---

## 3. The QueueTab Solution
QueueTab solves these challenges through strict separation of concerns:
* **Immutable Bookkeeping:** All groups, memberships, expense logs, and split records are recorded directly on BOT Chain Mainnet.
* **Strict Non-Custodial Nature:** The contract holds zero token balances and contains no payment transfer logic.
* **Integer-Safe Arithmetic:** Guarantees zero precision loss at the wei level.
* **Transparent Net Balance Calculations:** Dynamically calculates exact liabilities:
  $$\text{Net Balance} = \text{Amount Paid} - \text{Share Owed}$$

---

## 4. Mathematical Model & Remainder Handling

Let $G$ represent a group with $N$ active members:
$$M = \{m_1, m_2, \dots, m_N\}$$

When member $m_p \in M$ records an expense with amount $A$ (in wei), where $A > 0$:

1. **Equal Share Distribution:**
   Each member's debt obligation increases by the integer quotient:
   $$S = \lfloor \frac{A}{N} \rfloor$$
   $$\forall m_i \in M, \quad \text{ShareOwed}(m_i) \leftarrow \text{ShareOwed}(m_i) + S$$

2. **Payer Contribution Tracking:**
   $$\text{AmountPaid}(m_p) \leftarrow \text{AmountPaid}(m_p) + A$$

3. **Indivisible Remainder Tracking:**
   Any remainder $R$:
   $$R = A \pmod N$$
   remains preserved on the immutable `Expense` struct. It is not arbitrarily assigned to arbitrary members, maintaining strict mathematical conservation and preventing fractional liability inflation.

4. **Net Settlement Balance:**
   $$\text{NetBalance}(m_i) = \text{AmountPaid}(m_i) - \text{ShareOwed}(m_i)$$
   * **$\text{NetBalance} > 0$ (Creditor):** Member has contributed more than their fair share.
   * **$\text{NetBalance} < 0$ (Debtor):** Member owes liabilities to the group.
   * **$\text{NetBalance} = 0$ (Settled):** Member is completely settled.

---

## 5. Smart Contract Architecture

The core contract [`QueueTab.sol`](file:///contracts/QueueTab.sol) is compiled with Solidity `^0.8.20` using the `viaIR` optimizer.

### Core Functions
* `createGroup(string name, string description)`: Instantiates a new group and designates the caller as Admin and member #1.
* `addMember(uint256 groupId, address member)`: Admin-only function to register new member addresses. Validates that address is non-zero and not already registered.
* `recordExpense(uint256 groupId, string title, string description, uint256 amount)`: Member-only function to record a shared expense and instantly distribute liabilities across all existing members.
* `getGroupBalances(uint256 groupId)`: Batch-returns all members, amounts paid, shares owed, and net balances in a single gas-efficient view call.

---

## 6. Security Analysis
* **Zero Custody:** The contract does not implement `receive()`, `fallback()`, or transfer functions. Funds cannot be locked or drained.
* **Access Control:** Custom modifiers (`onlyExistingGroup`, `onlyAdmin`, `onlyMember`) prevent unauthorized state modifications.
* **Tested & Verified:** Comprehensive test suite with 18 automated passing unit tests in Hardhat.

---

## 7. Roadmap
* **Phase 1 (Complete):** Core contract development, BOT Chain Mainnet deployment, contract verification, responsive Next.js 14 frontend.
* **Phase 2:** Expense category tagging (Dining, Housing, Travel, Operations) and CSV export.
* **Phase 3:** Optional wallet-to-wallet P2P settlement links and multi-currency conversion views.

