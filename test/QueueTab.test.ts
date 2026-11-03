import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { QueueTab } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("QueueTab Smart Contract", function () {
  let queueTab: QueueTab;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let charlie: HardhatEthersSigner;
  let nonMember: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, alice, bob, charlie, nonMember] = await ethers.getSigners();
    const QueueTabFactory = await ethers.getContractFactory("QueueTab");
    queueTab = (await QueueTabFactory.deploy()) as QueueTab;
    await queueTab.waitForDeployment();
  });

  describe("Group Creation", function () {
    it("should successfully create a new group with creator as admin and first member", async function () {
      const tx = await queueTab.connect(owner).createGroup("Trip to Tokyo", "Vacation expenses");
      await expect(tx)
        .to.emit(queueTab, "GroupCreated")
        .withArgs(1, "Trip to Tokyo", owner.address, (await ethers.provider.getBlock("latest"))?.timestamp);

      const group = await queueTab.getGroup(1);
      expect(group.id).to.equal(1n);
      expect(group.name).to.equal("Trip to Tokyo");
      expect(group.description).to.equal("Vacation expenses");
      expect(group.admin).to.equal(owner.address);
      expect(group.totalSpending).to.equal(0n);
      expect(group.memberCount).to.equal(1n);
      expect(group.expenseCount).to.equal(0n);

      const members = await queueTab.getGroupMembers(1);
      expect(members.length).to.equal(1);
      expect(members[0]).to.equal(owner.address);
      expect(await queueTab.isGroupMember(1, owner.address)).to.be.true;

      const userGroups = await queueTab.getUserGroups(owner.address);
      expect(userGroups.length).to.equal(1);
      expect(userGroups[0]).to.equal(1n);
    });

    it("should reject group creation with empty name", async function () {
      await expect(queueTab.connect(owner).createGroup("", "No name")).to.be.revertedWithCustomError(
        queueTab,
        "EmptyGroupName"
      );
    });

    it("should increment group counter across multiple creations", async function () {
      await queueTab.connect(owner).createGroup("Group A", "Desc A");
      await queueTab.connect(alice).createGroup("Group B", "Desc B");

      expect(await queueTab.getGroupCount()).to.equal(2n);

      const group1 = await queueTab.getGroup(1);
      const group2 = await queueTab.getGroup(2);

      expect(group1.admin).to.equal(owner.address);
      expect(group2.admin).to.equal(alice.address);
    });
  });

  describe("Group Information Updates", function () {
    beforeEach(async function () {
      await queueTab.connect(owner).createGroup("Apartment 4B", "Monthly utilities");
    });

    it("should allow group admin to update group information", async function () {
      await expect(
        queueTab.connect(owner).updateGroup(1, "Apartment 4B - Renamed", "Updated utilities")
      )
        .to.emit(queueTab, "GroupUpdated")
        .withArgs(1, "Apartment 4B - Renamed", "Updated utilities", owner.address);

      const group = await queueTab.getGroup(1);
      expect(group.name).to.equal("Apartment 4B - Renamed");
      expect(group.description).to.equal("Updated utilities");
    });

    it("should prevent non-admin from updating group information", async function () {
      await expect(
        queueTab.connect(alice).updateGroup(1, "Hacked Name", "Hacked")
      ).to.be.revertedWithCustomError(queueTab, "NotGroupAdmin");
    });

    it("should reject empty group name during update", async function () {
      await expect(
        queueTab.connect(owner).updateGroup(1, "", "Desc")
      ).to.be.revertedWithCustomError(queueTab, "EmptyGroupName");
    });
  });

  describe("Member Management", function () {
    beforeEach(async function () {
      await queueTab.connect(owner).createGroup("Ski Trip", "Winter cabin");
    });

    it("should allow admin to add members", async function () {
      await expect(queueTab.connect(owner).addMember(1, alice.address))
        .to.emit(queueTab, "MemberAdded")
        .withArgs(1, alice.address, owner.address);

      const members = await queueTab.getGroupMembers(1);
      expect(members.length).to.equal(2);
      expect(members).to.include(alice.address);
      expect(await queueTab.isGroupMember(1, alice.address)).to.be.true;

      const aliceGroups = await queueTab.getUserGroups(alice.address);
      expect(aliceGroups).to.include(1n);
    });

    it("should prevent non-admin from adding members", async function () {
      await expect(
        queueTab.connect(alice).addMember(1, bob.address)
      ).to.be.revertedWithCustomError(queueTab, "NotGroupAdmin");
    });

    it("should reject duplicate members", async function () {
      await queueTab.connect(owner).addMember(1, alice.address);
      await expect(
        queueTab.connect(owner).addMember(1, alice.address)
      ).to.be.revertedWithCustomError(queueTab, "MemberAlreadyExists");

      // Also admin is already a member
      await expect(
        queueTab.connect(owner).addMember(1, owner.address)
      ).to.be.revertedWithCustomError(queueTab, "MemberAlreadyExists");
    });

    it("should reject zero address member", async function () {
      await expect(
        queueTab.connect(owner).addMember(1, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(queueTab, "InvalidAddress");
    });
  });

  describe("Expense Recording & Equal Distribution", function () {
    beforeEach(async function () {
      // Create group with owner, alice, and bob (3 members)
      await queueTab.connect(owner).createGroup("Road Trip", "Fuel & Food");
      await queueTab.connect(owner).addMember(1, alice.address);
      await queueTab.connect(owner).addMember(1, bob.address);
    });

    it("should allow registered members to record expenses", async function () {
      // 300 ether / wei split equally among 3 members = 100 each
      const amount = ethers.parseEther("3");
      const expectedSplit = ethers.parseEther("1");

      await expect(
        queueTab.connect(alice).recordExpense(1, "Gas Station", "Full tank", amount)
      )
        .to.emit(queueTab, "ExpenseRecorded")
        .withArgs(1, 1, alice.address, amount, expectedSplit, "Gas Station");

      const group = await queueTab.getGroup(1);
      expect(group.totalSpending).to.equal(amount);
      expect(group.expenseCount).to.equal(1n);

      const expenses = await queueTab.getExpenses(1);
      expect(expenses.length).to.equal(1);
      expect(expenses[0].id).to.equal(1n);
      expect(expenses[0].title).to.equal("Gas Station");
      expect(expenses[0].description).to.equal("Full tank");
      expect(expenses[0].amount).to.equal(amount);
      expect(expenses[0].recordedBy).to.equal(alice.address);
      expect(expenses[0].memberCountAtRecording).to.equal(3n);
      expect(expenses[0].splitAmountPerMember).to.equal(expectedSplit);
    });

    it("should reject expense submission from non-members", async function () {
      await expect(
        queueTab.connect(nonMember).recordExpense(1, "Snacks", "Chips", 100)
      ).to.be.revertedWithCustomError(queueTab, "NotGroupMember");
    });

    it("should reject expense with empty title", async function () {
      await expect(
        queueTab.connect(owner).recordExpense(1, "", "Desc", 100)
      ).to.be.revertedWithCustomError(queueTab, "EmptyExpenseTitle");
    });

    it("should reject expense with zero amount", async function () {
      await expect(
        queueTab.connect(owner).recordExpense(1, "Free item", "None", 0)
      ).to.be.revertedWithCustomError(queueTab, "InvalidExpenseAmount");
    });
  });

  describe("Balance Calculations & Net Balance Formula", function () {
    beforeEach(async function () {
      // Group with owner, alice, and bob (3 members)
      await queueTab.connect(owner).createGroup("Dinner Club", "Shared food");
      await queueTab.connect(owner).addMember(1, alice.address);
      await queueTab.connect(owner).addMember(1, bob.address);
    });

    it("should correctly compute individual balances when one member pays", async function () {
      // Alice pays 300
      // Member count: 3 (owner, alice, bob)
      // Share per member: 100
      // Alice: paid 300, owes 100 -> net = +200
      // Owner: paid 0, owes 100 -> net = -100
      // Bob: paid 0, owes 100 -> net = -100
      await queueTab.connect(alice).recordExpense(1, "Italian Dinner", "Pasta & Wine", 300);

      const [alicePaid, aliceOwed, aliceNet] = await queueTab.getMemberBalance(1, alice.address);
      expect(alicePaid).to.equal(300n);
      expect(aliceOwed).to.equal(100n);
      expect(aliceNet).to.equal(200n); // Positive balance

      const [ownerPaid, ownerOwed, ownerNet] = await queueTab.getMemberBalance(1, owner.address);
      expect(ownerPaid).to.equal(0n);
      expect(ownerOwed).to.equal(100n);
      expect(ownerNet).to.equal(-100n); // Negative balance

      const [bobPaid, bobOwed, bobNet] = await queueTab.getMemberBalance(1, bob.address);
      expect(bobPaid).to.equal(0n);
      expect(bobOwed).to.equal(100n);
      expect(bobNet).to.equal(-100n); // Negative balance

      // Verify batch getGroupBalances
      const [members, paidArr, owedArr, netArr] = await queueTab.getGroupBalances(1);
      expect(members.length).to.equal(3);
      expect(paidArr[0]).to.equal(0n); // owner
      expect(paidArr[1]).to.equal(300n); // alice
      expect(paidArr[2]).to.equal(0n); // bob
      expect(owedArr[0]).to.equal(100n);
      expect(owedArr[1]).to.equal(100n);
      expect(owedArr[2]).to.equal(100n);
      expect(netArr[0]).to.equal(-100n);
      expect(netArr[1]).to.equal(200n);
      expect(netArr[2]).to.equal(-100n);
    });

    it("should correctly calculate balances with multiple expenses from different members", async function () {
      // 3 members: owner, alice, bob
      // Expense 1: Alice pays 300 -> each owes 100
      //   owner: paid 0, owed 100, net -100
      //   alice: paid 300, owed 100, net +200
      //   bob: paid 0, owed 100, net -100
      // Expense 2: Bob pays 150 -> each owes 50
      //   owner: paid 0, owed 150, net -150
      //   alice: paid 300, owed 150, net +150
      //   bob: paid 150, owed 150, net 0 (exactly settled)
      // Expense 3: Owner pays 150 -> each owes 50
      //   owner: paid 150, owed 200, net -50
      //   alice: paid 300, owed 200, net +100
      //   bob: paid 150, owed 200, net -50

      await queueTab.connect(alice).recordExpense(1, "Dinner", "Food", 300);
      await queueTab.connect(bob).recordExpense(1, "Dessert", "Ice cream", 150);
      await queueTab.connect(owner).recordExpense(1, "Taxi", "Ride home", 150);

      const [, , ownerNet] = await queueTab.getMemberBalance(1, owner.address);
      const [, , aliceNet] = await queueTab.getMemberBalance(1, alice.address);
      const [, , bobNet] = await queueTab.getMemberBalance(1, bob.address);

      expect(ownerNet).to.equal(-50n);
      expect(aliceNet).to.equal(100n);
      expect(bobNet).to.equal(-50n);

      // Total net sum across all members must equal zero (conservative system balance)
      expect(ownerNet + aliceNet + bobNet).to.equal(0n);
    });

    it("should properly handle integer division rounding remainder", async function () {
      // 100 wei split among 3 members:
      // 100 / 3 = 33 wei per member
      // Remainder: 1 wei
      // Payer (Alice) paid 100, owes 33 -> net = +67
      // Other members owe 33 -> net = -33
      await queueTab.connect(alice).recordExpense(1, "Item with remainder", "Odd amount", 100);

      const [alicePaid, aliceOwed, aliceNet] = await queueTab.getMemberBalance(1, alice.address);
      expect(alicePaid).to.equal(100n);
      expect(aliceOwed).to.equal(33n);
      expect(aliceNet).to.equal(67n);

      const [bobPaid, bobOwed, bobNet] = await queueTab.getMemberBalance(1, bob.address);
      expect(bobPaid).to.equal(0n);
      expect(bobOwed).to.equal(33n);
      expect(bobNet).to.equal(-33n);

      const expenses = await queueTab.getExpenses(1);
      expect(expenses[0].splitAmountPerMember).to.equal(33n);
      expect(expenses[0].amount).to.equal(100n);
    });
  });

  describe("Query Non-Existent Groups", function () {
    it("should revert when querying non-existent group", async function () {
      await expect(queueTab.getGroup(999)).to.be.revertedWithCustomError(
        queueTab,
        "GroupNotFound"
      );
      await expect(queueTab.getGroupMembers(999)).to.be.revertedWithCustomError(
        queueTab,
        "GroupNotFound"
      );
      await expect(queueTab.getExpenses(999)).to.be.revertedWithCustomError(
        queueTab,
        "GroupNotFound"
      );
      await expect(
        queueTab.getMemberBalance(999, alice.address)
      ).to.be.revertedWithCustomError(queueTab, "GroupNotFound");
    });
  });
});
