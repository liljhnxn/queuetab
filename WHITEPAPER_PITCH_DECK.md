# QueueTab: Whitepaper & Pitch Deck
**Decentralized Group Expense Ledger on Botchain**

* **Live dApp:** [http://localhost:3000](http://localhost:3000) (Local) / [https://github.com/liljhnxn/queuetab](https://github.com/liljhnxn/queuetab)
* **Contract Address (BOT Chain Mainnet):** [`0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB`](https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB#code)
* **Chain ID:** `677` | **Currency:** `BOT`
* **BOT Chain Website:** [https://botchain.ai](https://botchain.ai)
* **BOT Chain Explorer:** [https://scan.botchain.ai](https://scan.botchain.ai)

---

# SECTION 1: WHITEPAPER

## 1. Executive Summary
**QueueTab** is an on-chain, non-custodial shared expense tracking protocol deployed on the BOT Chain Mainnet. Unlike traditional Web2 expense-sharing platforms (e.g., Splitwise) that operate as closed corporate databases monetized through intrusive paywalls and ads, or custodial Web3 applications that require risky smart contract fund deposits, QueueTab functions as a pure, immutable accounting ledger. 

QueueTab provides decentralized groups—such as roommates, travel companions, DAO working groups, and event organizers—with automated equal splits, integer-safe division math, transparent net liability calculation, and cryptographic verifiability without handling or custodying user funds.

---

## 2. Problem Statement
Group expense management faces fundamental frictions across both Web2 and Web3 paradigms:

1. **Web2 Centralization & Monopolistic Paywalls:** Popular platforms have introduced restrictive free-tier limitations, tracking cookies, and advertising while keeping balance data locked in proprietary silos.
2. **Custodial Risk in Web3 Solutions:** Most Web3 expense apps attempt to process transfers or hold escrow funds within the smart contract. This introduces severe attack surfaces (reentrancy, frozen liquidity, regulatory money-transmitter liabilities, and unnecessary contract approval risks).
3. **Floating-Point & Rounding Vulnerabilities:** Financial tracking protocols often suffer from truncation and fractional precision errors when dividing indivisible currency units among odd numbers of participants.

---

## 3. The QueueTab Solution
QueueTab eliminates custody risk entirely by separating **expense recording** from **settlement execution**:

* **Immutable Accounting Layer:** Expenses are recorded permanently on Botchain, providing trustless auditability.
* **Non-Custodial Architecture:** The smart contract neither accepts native tokens nor transfers funds during expense logging.
* **Deterministic Integer-Safe Division:** All splits are computed at the wei level with strictly defined remainder semantics.
* **Instant Transparent Balances:** Each member's financial posture is computed dynamically using on-chain state:
  $$\text{Net Balance} = \text{Amount Paid} - \text{Share Owed}$$

---

## 4. Mathematical Model & Rounding Specification

Let $G$ be an active expense group with $N$ registered members where $N \ge 1$:
$$M = \{m_1, m_2, \dots, m_N\}$$

When member $m_p \in M$ records an expense of amount $A > 0$:

1. **Equal Liability Distribution:**
   Each member's share liability $S$ is calculated using integer division:
   $$S = \lfloor \frac{A}{N} \rfloor$$
   $$\forall m_i \in M, \quad \text{ShareOwed}(m_i) \leftarrow \text{ShareOwed}(m_i) + S$$

2. **Payer Contribution Tracking:**
   $$\text{AmountPaid}(m_p) \leftarrow \text{AmountPaid}(m_p) + A$$

3. **Indivisible Remainder Handling:**
   Any remainder $R = A \pmod N$ is tracked with the on-chain `Expense` struct. It is not arbitrarily distributed to inflate member obligations, preserving mathematical conservation and preventing fractional precision exploits.

4. **Net Settlement Balance:**
   $$\text{NetBalance}(m_i) = \text{AmountPaid}(m_i) - \text{ShareOwed}(m_i)$$
   * $\text{NetBalance}(m_i) > 0$: Member has paid more than their share (group creditor).
   * $\text{NetBalance}(m_i) < 0$: Member owes liabilities to the group (group debtor).
   * $\text{NetBalance}(m_i) = 0$: Member is exactly settled.

---

## 5. System Architecture & Smart Contract Design

```
+-------------------------------------------------------------+
|                     Next.js 14 Frontend                     |
|           (wagmi v2 / viem / Tailwind CSS / React 18)       |
+-------------------------------------------------------------+
                              |
                     RPC: https://rpc.botchain.ai
                              |
+-------------------------------------------------------------+
|                BOT Chain Mainnet (Chain ID: 677)            |
|                                                             |
|   +-----------------------------------------------------+   |
|   |                  QueueTab.sol                       |   |
|   |  - createGroup(name, desc)                          |   |
|   |  - addMember(groupId, member)                       |   |
|   |  - recordExpense(groupId, title, desc, amount)      |   |
|   |  - getGroupBalances(groupId)                        |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

### Access Control Matrix
* `createGroup`: Open to any connected Web3 address. Creator assigned as Admin.
* `addMember`: Strictly restricted to group Admin (`onlyAdmin`). Rejects `address(0)` and duplicate members.
* `recordExpense`: Restricted to existing members (`onlyMember`). Requires amount $> 0$ and non-empty title.
* `updateGroup`: Restricted to group Admin (`onlyAdmin`).

---

# SECTION 2: PITCH DECK OUTLINE

```
================================================================================
SLIDE 1: TITLE SLIDE
QueueTab: The Decentralized Shared Expense Ledger
Subtitle: Transparent, Zero-Custody Group Expense Tracking for the Web3 Era
Ecosystem: BOT Chain Mainnet
BOT Chain Website: https://botchain.ai
BOT Chain Explorer: https://scan.botchain.ai
Presenter: QueueTab Core Team
================================================================================

SLIDE 2: THE PROBLEM
* Splitwise & Web2 apps: Paywalls, aggressive subscription prompts, and centralized data harvesting.
* Crypto alternatives: Over-engineered with risky fund escrow, payment approvals, and token requirements.
* Group Reality: Friends and DAO working groups just want an honest, immutable record of who paid what.

================================================================================
SLIDE 3: THE SOLUTION
* QueueTab brings non-custodial expense bookkeeping to Botchain.
* Record shared expenses -> Auto-split equally -> View net balances on-chain.
* Zero tokens required to use. Zero fund holding. 100% transparent.

================================================================================
SLIDE 4: PRODUCT DEMO & SCREENSHOTS
* Dashboard: Instant overview of groups, member counts, and total spending.
* Group Page: Detailed member breakdown with Net Balance status badges (Creditor / Debtor / Settled).
* Live Modals: Real-time split preview (e.g. "~1.5 BOT / member") before signing transactions.

================================================================================
SLIDE 5: UNDER THE HOOD (TECH STACK)
* Smart Contract: Solidity ^0.8.20 with viaIR optimization, custom errors, and zero external token dependencies.
* Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS with customized charcoal theme.
* Web3 Connectivity: wagmi v2, viem, MetaMask connector with automatic Botchain network switching.

================================================================================
SLIDE 6: SECURITY & AUDITABILITY
* Non-Custodial: Cannot be drained because the contract does not hold liquidity.
* Integer-Safe: Safe remainder accounting prevents decimal overflow/truncation errors.
* Fully Verified: 18/18 Automated test suites passing. Contract source code verified on Botchain Explorer.

================================================================================
SLIDE 7: ECOSYSTEM FIT (WHY BOTCHAIN?)
* High throughput and low gas fees make frequent micro-expense tracking viable.
* Ideal utility showcase for Botchain's EVM compatibility and speed.
* Natural gateway for onboarding Web2 users into Botchain with familiar utility.

================================================================================
SLIDE 8: ROADMAP & FUTURE VISION
* Phase 1 (Completed): Core protocol, BOT Chain Mainnet deployment, contract verification, full dApp UI.
* Phase 2: Category tagging (Travel, Dining, Utilities), exportable CSV reports, and ENS/BNS name resolution.
* Phase 3: Optional 1-click peer-to-peer settlement modules (direct wallet-to-wallet transfer prompts).

================================================================================
SLIDE 9: TRACTION & METRICS
* Contract: 0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB (BOT Chain Mainnet)
* Source Code: 100% open source on GitHub.
* Production Readiness: Next.js production build compiled with 0 errors.

================================================================================
SLIDE 10: CALL TO ACTION
* Try the dApp: Run locally or explore on BOT Chain Mainnet.
* Explore the Contract: https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB
* BOT Chain Official Website: https://botchain.ai
* BOT Chain Block Explorer: https://scan.botchain.ai
* Contact / GitHub: https://github.com/liljhnxn/queuetab
================================================================================
```

---

## Cloud Storage / Shareable Links
* **BOT Chain Official Website:** [https://botchain.ai](https://botchain.ai)
* **BOT Chain Block Explorer:** [https://scan.botchain.ai](https://scan.botchain.ai)
* **GitHub Repository:** [https://github.com/liljhnxn/queuetab](https://github.com/liljhnxn/queuetab)
* **Verified Contract Code:** [https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB#code](https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB#code)
* **Pitch Deck & Whitepaper Document:** Saved locally at `docs/WHITEPAPER_PITCH_DECK.md`
