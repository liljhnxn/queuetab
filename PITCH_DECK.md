# QueueTab Pitch Deck

**Decentralized Shared Expense Ledger on Botchain**
* **Network:** Botchain Mainnet (Chain ID: `677`, BOT)
* **Contract:** [`0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB`](https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB#code)
* **Website / Repo:** [https://github.com/liljhnxn/queuetab](https://github.com/liljhnxn/queuetab)

---

## Slide 1: Title
* **Header:** QueueTab
* **Sub-header:** On-Chain Group Expense Tracking for the Web3 Era
* **Tagline:** Track shared expenses with friends, roommates, and teams with zero custody risk.
* **Network:** Powered by BOT Chain Mainnet
* **BOT Chain Website:** [https://botchain.ai](https://botchain.ai)
* **BOT Chain Explorer:** [https://scan.botchain.ai](https://scan.botchain.ai)

---

## Slide 2: The Problem
* **Web2 Expense Apps (Splitwise, etc.):** 
  * Invasive monthly subscription paywalls for basic features.
  * Advertising and monetization of personal financial graphs.
  * Centralized servers subject to downtime and single points of failure.
* **Existing Web3 Tools:**
  * Over-engineered with token deposit requirements and custodial smart contracts.
  * Users risk losing funds to exploits or locked liquidity.

---

## Slide 3: The Solution
* **Pure On-Chain Bookkeeping:** Records group activities and splits liabilities mathematically on Botchain.
* **100% Non-Custodial:** Never holds, escrows, or transfers user crypto.
* **Instant Transparency:** Transparent formula:
  $$\text{Net Balance} = \text{Amount Paid} - \text{Share Owed}$$
* **Low Cost & Fast:** Powered by Botchain’s sub-second finality and near-zero gas fees.

---

## Slide 4: Key Features & User Experience
* **MetaMask & Web3 Native:** 1-click connect with automatic network switching to BOT Chain Mainnet.
* **Group Management:** Admins create groups and invite members via Ethereum-compatible wallet addresses.
* **Real-Time Split Preview:** Live preview shows cost-per-member (e.g. `~1.50 BOT / member`) before signing on-chain.
* **Interactive Balance Table:** Color-coded badges instantly identify Creditors (🟢), Debtors (🔴), and Settled (⚪) members.

---

## Slide 5: Mathematical Integrity & Security
* **Integer-Safe Math:** Operates strictly at the wei level. No floating-point rounding errors.
* **Remainder Conservation:** Unallocated sub-unit remainders ($A \pmod N$) stay tracked on the immutable record.
* **Battle-Tested:** 18 automated Hardhat tests passing with 100% coverage on core arithmetic.
* **Verified Code:** Source code publicly verified on Botchain Block Explorer.

---

## Slide 6: Technology Stack
* **Smart Contracts:** Solidity ^0.8.20 (`viaIR: true`), Hardhat toolbox.
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
* **Web3 Integration:** wagmi v2, viem, TanStack Query.
* **Design Language:** Dark charcoal theme (`#0b0c10`), purple (`#8b5cf6`) and emerald (`#10b981`) accents.

---

## Slide 7: Market Opportunity & Target Audience
* **Roommates & Housemates:** Splitting rent, utilities, and household supplies.
* **Travel Groups:** Vacations, road trips, and shared dining.
* **Hackathon & DAO Teams:** Tracking shared operational, hosting, and event expenses transparently.
* **Web3 Communities:** Bringing real-world everyday utility onto the Botchain network.

---

## Slide 8: Why Botchain?
* **High Throughput:** Handles continuous micro-transactions without high overhead.
* **Ultra-Low Gas Fees:** Recording small grocery or taxi expenses remains economically viable.
* **EVM Compatibility:** Smooth developer tooling and seamless MetaMask user onboarding.

---

## Slide 9: Roadmap
* **Milestone 1 (Complete):** Core smart contract, test suite, Botchain Mainnet deployment, and verified explorer integration.
* **Milestone 2:** Expense category filters, receipt file attachments (IPFS), and CSV ledger export.
* **Milestone 3:** Native peer-to-peer 1-click wallet transfer links and ENS/BNS domain name resolution.

---

## Slide 10: Call to Action / Contact
* **Explore Contract:** [https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB](https://scan.botchain.ai/address/0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB)
* **GitHub Repository:** [https://github.com/liljhnxn/queuetab](https://github.com/liljhnxn/queuetab)
* **Local dApp:** Run `npm run dev` to launch locally at `http://localhost:3000`.

