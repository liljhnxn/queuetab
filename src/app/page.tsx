"use client";

import React, { useState, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { QUEUETAB_ABI } from "@/config/abi";
import { QUEUETAB_CONTRACT_ADDRESS } from "@/config/contract";
import { OverviewStats } from "@/components/OverviewStats";
import { GroupCard } from "@/components/GroupCard";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { NoticeBanner } from "@/components/NoticeBanner";
import { Plus, Layers, Loader2, Sparkles, Filter } from "lucide-react";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");

  // Read total group count
  const {
    data: groupCountData,
    isLoading: isGroupCountLoading,
    refetch: refetchGroupCount,
  } = useReadContract({
    address: QUEUETAB_CONTRACT_ADDRESS,
    abi: QUEUETAB_ABI,
    functionName: "getGroupCount",
  });

  // Read total expense count
  const {
    data: totalExpenseCountData,
    refetch: refetchExpenseCount,
  } = useReadContract({
    address: QUEUETAB_CONTRACT_ADDRESS,
    abi: QUEUETAB_ABI,
    functionName: "getTotalExpenseCount",
  });

  // Read user's groups
  const {
    data: userGroupIdsData,
    refetch: refetchUserGroups,
  } = useReadContract({
    address: QUEUETAB_CONTRACT_ADDRESS,
    abi: QUEUETAB_ABI,
    functionName: "getUserGroups",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const totalGroups = groupCountData ? Number(groupCountData) : 0;
  const totalExpenses = totalExpenseCountData ? Number(totalExpenseCountData) : 0;
  const userGroupIds = useMemo(() => {
    if (!userGroupIdsData) return [];
    return (userGroupIdsData as readonly bigint[]).map((id) => id);
  }, [userGroupIdsData]);

  // Generate contracts array to batch-read all group details
  const groupContracts = useMemo(() => {
    const calls = [];
    for (let i = 1; i <= totalGroups; i++) {
      calls.push({
        address: QUEUETAB_CONTRACT_ADDRESS,
        abi: QUEUETAB_ABI,
        functionName: "getGroup" as const,
        args: [BigInt(i)] as const,
      });
    }
    return calls;
  }, [totalGroups]);

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    refetch: refetchGroups,
  } = useReadContracts({
    contracts: groupContracts,
    query: {
      enabled: totalGroups > 0,
    },
  });

  // Process loaded groups
  const allGroups = useMemo(() => {
    if (!groupsData) return [];
    return groupsData
      .map((item, index) => {
        if (!item.result) return null;
        const res = item.result as [
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
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);
  }, [groupsData]);

  // Calculate total spending across all groups
  const totalSpendingWei = useMemo(() => {
    return allGroups.reduce((acc, curr) => acc + curr.totalSpending, 0n);
  }, [allGroups]);

  // Filter groups
  const displayedGroups = useMemo(() => {
    if (filterMode === "mine" && address) {
      const userSet = new Set(userGroupIds.map((id) => id.toString()));
      return allGroups.filter((g) => userSet.has(g.id.toString()));
    }
    return allGroups;
  }, [allGroups, filterMode, userGroupIds, address]);

  const handleRefreshAll = () => {
    refetchGroupCount();
    refetchExpenseCount();
    refetchUserGroups();
    refetchGroups();
  };

  return (
    <div>
      {/* Notice Banner */}
      <NoticeBanner />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 tracking-tight">
              Shared Expense Dashboard
            </h1>
            <span className="p-1 rounded-md bg-brand-purple/10 text-brand-purple">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Create groups, track shared costs with roommates & friends, and calculate exact balances.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white font-medium text-sm transition-all shadow-lg shadow-brand-purple/20 hover:shadow-brand-purple/30 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Expense Group</span>
        </button>
      </div>

      {/* Overview Stats */}
      <OverviewStats
        totalGroups={totalGroups}
        totalExpenses={totalExpenses}
        totalSpendingWei={totalSpendingWei}
        userGroupsCount={userGroupIds.length}
      />

      {/* Groups Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-purple" />
          <h2 className="text-lg font-bold text-gray-100">Expense Groups</h2>
          <span className="text-xs text-gray-400 font-mono px-2 py-0.5 rounded-full bg-charcoal-800 border border-charcoal-700">
            {displayedGroups.length}
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-850 border border-charcoal-700/80 self-start sm:self-auto text-xs">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterMode === "all"
                ? "bg-brand-purple text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            All Groups ({totalGroups})
          </button>
          <button
            onClick={() => setFilterMode("mine")}
            disabled={!isConnected}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              filterMode === "mine"
                ? "bg-brand-purple text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 disabled:opacity-40"
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>My Groups ({userGroupIds.length})</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {(isGroupCountLoading || isGroupsLoading) && (
        <div className="p-16 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple mb-3" />
          <p className="text-sm font-medium">Fetching on-chain groups from BOT Chain...</p>
        </div>
      )}

      {/* Empty State */}
      {!isGroupCountLoading && !isGroupsLoading && displayedGroups.length === 0 && (
        <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto mb-4 text-gray-500">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-gray-200">
            {filterMode === "mine" ? "You haven't joined any groups yet" : "No expense groups created yet"}
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-6">
            {filterMode === "mine"
              ? "Create your first group or have an admin add your wallet address to an existing group."
              : "Be the first to create an on-chain group and start tracking shared expenses with friends."}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Group</span>
          </button>
        </div>
      )}

      {/* Group Cards Grid */}
      {!isGroupCountLoading && !isGroupsLoading && displayedGroups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedGroups.map((group) => (
            <GroupCard
              key={group.id.toString()}
              id={group.id}
              name={group.name}
              description={group.description}
              admin={group.admin}
              createdAt={group.createdAt}
              totalSpending={group.totalSpending}
              memberCount={group.memberCount}
              expenseCount={group.expenseCount}
              currentUser={address}
            />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefreshAll}
      />
    </div>
  );
}

