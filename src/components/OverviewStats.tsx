import React from "react";
import { Users, ReceiptText, Coins, Layers } from "lucide-react";
import { formatBohr } from "@/utils/format";
import { BOTCHAIN_CURRENCY_SYMBOL } from "@/config/network";

interface OverviewStatsProps {
  totalGroups: number;
  totalExpenses: number;
  totalSpendingWei: bigint;
  userGroupsCount: number;
}

export function OverviewStats({
  totalGroups,
  totalExpenses,
  totalSpendingWei,
  userGroupsCount,
}: OverviewStatsProps) {
  const stats = [
    {
      title: "Total Groups",
      value: totalGroups.toString(),
      label: `${userGroupsCount} of your groups`,
      icon: Layers,
      color: "purple",
    },
    {
      title: "Recorded Expenses",
      value: totalExpenses.toString(),
      label: "On-chain ledger logs",
      icon: ReceiptText,
      color: "purple",
    },
    {
      title: "Total Group Spending",
      value: `${formatBohr(totalSpendingWei)} ${BOTCHAIN_CURRENCY_SYMBOL}`,
      label: "Combined tracked value",
      icon: Coins,
      color: "green",
    },
    {
      title: "Active Involvements",
      value: userGroupsCount.toString(),
      label: "Groups you belong to",
      icon: Users,
      color: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const isGreen = stat.color === "green";

        return (
          <div
            key={i}
            className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 p-5 hover:border-charcoal-600 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">
                {stat.title}
              </span>
              <div
                className={`p-2 rounded-xl ${
                  isGreen
                    ? "bg-brand-green/10 text-brand-green"
                    : "bg-brand-purple/10 text-brand-purple"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-100 tracking-tight font-mono">
              {stat.value}
            </div>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

