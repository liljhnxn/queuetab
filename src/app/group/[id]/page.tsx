"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { QUEUETAB_ABI } from "@/config/abi";
import { QUEUETAB_CONTRACT_ADDRESS } from "@/config/contract";
import { formatBot, formatDateTime, shortenAddress } from "@/utils/format";
import { BOTCHAIN_CURRENCY_SYMBOL } from "@/config/network";
import { BalanceSummary } from "@/components/BalanceSummary";
import { ExpenseList, ExpenseRecord } from "@/components/ExpenseList";
import { RecordExpenseModal } from "@/components/RecordExpenseModal";
import { AddMemberModal } from "@/components/AddMemberModal";
import {
  ArrowLeft,
  Users,
  Receipt,
  Plus,
  UserPlus,
  Shield,
  Coins,
  Calendar,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function GroupDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const groupIdBigInt = useMemo(() => {
    try {
      return BigInt(params.id);
    } catch {
      return 0n;
    }
  }, [params.id]);

  const { address, isConnected } = useAccount();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // 1. Fetch group details
  const {
    data: groupData,
    isLoading: isGroupLoading,
    refetch: refetchGroup,
  } = useReadContract({
    address: QUEUETAB_CONTRACT_ADDRESS,
    abi: QUEUETAB_ABI,
    functionName: "getGroup",
    args: [groupIdBigInt],
    query: {
      enabled: groupIdBigInt > 0n,
    },
  });

  // 2. Fetch group members
  const {
    data: membersData,
    isLoading: isMembersLoading,
    refetch: refetchMembers,
  } = useReadContract({
    address: QUEUETAB_CONTRACT_ADDRESS,
    abi: QUEUETAB_ABI,
    functionName: "getGroupMembers",
    args: [groupIdBigInt],
    query: {
      enabled: groupIdBigInt > 0n,
    },
  });

  // 3. Fetch all expenses
  const {
    data: expensesData,
    isLoading: isExpensesLoading,
    refetch: refetchExpenses,
  } = useReadContract({
    address: QUEUETAB_CONTRACT_ADDRESS,
    abi: QUEUETAB_ABI,
    functionName: "getExpenses",
    args: [groupIdBigInt],
    query: {
      enabled: groupIdBigInt > 0n,
    },
  });

  // 4. Fetch balances
  const {
    data: balancesData,
    isLoading: isBalancesLoading,
    refetch: refetchBalances,
  } = useReadContract({
    address: QUEUETAB_CONTRACT_ADDRESS,
    abi: QUEUETAB_ABI,
    functionName: "getGroupBalances",
    args: [groupIdBigInt],
    query: {
      enabled: groupIdBigInt > 0n,
    },
  });

  // Process data
  const group = useMemo(() => {
    if (!groupData) return null;
    const res = groupData as [
      bigint, // id
      string, // name
      string, // description
      string, // admin
      bigint, // createdAt
      bigint, // totalSpending
      bigint, // memberCount
      bigint  // expenseCount
    ];
    return {
      id: res[0],
      name: res[1],
      description: res[2],
      admin: res[3],
      createdAt: res[4],
      totalSpending: res[5],
      memberCount: res[6],
      expenseCount: res[7],
    };
  }, [groupData]);

  const members = useMemo(() => {
    if (!membersData) return [];
    return (membersData as readonly string[]).map((m) => m);
  }, [membersData]);

  const expenses: ExpenseRecord[] = useMemo(() => {
    if (!expensesData) return [];
    return (expensesData as readonly any[]).map((exp) => ({
      id: exp.id,
      groupId: exp.groupId,
      title: exp.title,
      description: exp.description,
      amount: exp.amount,
      recordedBy: exp.recordedBy,
      timestamp: exp.timestamp,
      memberCountAtRecording: exp.memberCountAtRecording,
      splitAmountPerMember: exp.splitAmountPerMember,
    }));
  }, [expensesData]);

  const balances = useMemo(() => {
    if (!balancesData) return [];
    const [memberAddrs, amountsPaid, sharesOwed, netBalances] = balancesData as [
      readonly string[],
      readonly bigint[],
      readonly bigint[],
      readonly bigint[]
    ];
    return memberAddrs.map((addr, i) => ({
      address: addr,
      paid: amountsPaid[i],
      owed: sharesOwed[i],
      net: netBalances[i],
    }));
  }, [balancesData]);

  const isAdmin = useMemo(() => {
    if (!address || !group) return false;
    return group.admin.toLowerCase() === address.toLowerCase();
  }, [address, group]);

  const isMember = useMemo(() => {
    if (!address) return false;
    return members.some((m) => m.toLowerCase() === address.toLowerCase());
  }, [address, members]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleRefreshAll = () => {
    refetchGroup();
    refetchMembers();
    refetchExpenses();
    refetchBalances();
  };

  const isLoading = isGroupLoading || isMembersLoading;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple mb-3" />
        <p className="text-sm font-medium">Loading group details from BOT Chain...</p>
      </div>
    );
  }

  if (!group || group.id === 0n) {
    return (
      <div className="py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto mb-4 text-gray-500">
          <AlertCircle className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-100 mb-2">Group Not Found</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
          The requested group does not exist on the smart contract or has not been created yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-gray-200 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Back Link & Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 tracking-tight">
                {group.name}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-charcoal-800 border border-charcoal-700 text-gray-400">
                Group #{group.id.toString()}
              </span>
            </div>
            {group.description && (
              <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                {group.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Shield className="w-3.5 h-3.5 text-brand-purple" />
                <span>Admin: {shortenAddress(group.admin)}</span>
                {isAdmin && (
                  <span className="text-[10px] text-brand-purple-light font-sans font-medium px-1.5 py-0.2 rounded bg-brand-purple/20">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Created {formatDateTime(group.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 text-xs font-semibold transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-brand-green" />
                <span>Add Member</span>
              </button>
            )}

            <button
              onClick={() => setIsRecordModalOpen(true)}
              disabled={!isMember}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold transition-all shadow-md shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Non-Member Banner */}
      {isConnected && !isMember && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-semibold text-amber-200">
              Observer Mode:
            </span>{" "}
            Your connected wallet ({shortenAddress(address)}) is not a member of this group. Only group members can record expenses and participate in splits. The administrator ({shortenAddress(group.admin)}) can add you.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Total Group Spending</span>
            <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-100">
            {formatBot(group.totalSpending)} {BOTCHAIN_CURRENCY_SYMBOL}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Sum of all recorded expenses</p>
        </div>

        <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Registered Members</span>
            <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-100">
            {members.length.toString()}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Participating in equal splits</p>
        </div>

        <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Recorded Expenses</span>
            <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-gray-100">
            {expenses.length.toString()}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Logged on BOT Chain Mainnet</p>
        </div>
      </div>

      {/* Balance Summary Section */}
      <div className="space-y-3">
        <BalanceSummary
          balances={balances}
          currentUser={address}
          adminAddress={group.admin}
        />
      </div>

      {/* Split Grid: Members List & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members Column (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-purple" />
              <h3 className="font-semibold text-gray-100 text-sm">
                Group Members ({members.length})
              </h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="text-xs text-brand-purple-light hover:underline font-medium"
              >
                + Add
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 divide-y divide-charcoal-700/50 overflow-hidden shadow-sm">
            {members.map((mem) => {
              const isCurrent = address && mem.toLowerCase() === address.toLowerCase();
              const isMemAdmin = mem.toLowerCase() === group.admin.toLowerCase();
              const isCopied = copiedAddress === mem;

              return (
                <div
                  key={mem}
                  className="p-3.5 flex items-center justify-between gap-2 hover:bg-charcoal-800/40 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-gray-300 flex-shrink-0">
                      <span className="font-mono text-[10px]">
                        {mem.slice(2, 4)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-mono text-gray-200">
                        <span>{shortenAddress(mem, 5)}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-brand-purple/20 text-brand-purple-light font-medium">
                            You
                          </span>
                        )}
                        {isMemAdmin && (
                          <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-charcoal-700 text-gray-300 font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono truncate">
                        {mem}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(mem)}
                    title="Copy full address"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-charcoal-700 transition-colors flex-shrink-0"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-brand-green" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-charcoal-850/60 border border-charcoal-700/40 text-[11px] text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-gray-300">
              <HelpCircle className="w-3.5 h-3.5 text-brand-purple" />
              <span>Equal Share Distribution</span>
            </div>
            <p>
              When an expense is recorded, it is divided integer-wise among all current members. New members joining later will only participate in future expense splits.
            </p>
          </div>
        </div>

        {/* Expenses Activity Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-purple" />
              <h3 className="font-semibold text-gray-100 text-sm">
                Expense History ({expenses.length})
              </h3>
            </div>
            {isMember && (
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="text-xs text-brand-purple-light hover:underline font-medium"
              >
                + Record Expense
              </button>
            )}
          </div>

          <ExpenseList expenses={expenses} currentUser={address} />
        </div>
      </div>

      {/* Modals */}
      <RecordExpenseModal
        groupId={group.id}
        memberCount={members.length}
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={handleRefreshAll}
      />

      <AddMemberModal
        groupId={group.id}
        existingMembers={members}
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
}
