"use client";

import React from "react";
import Link from "next/link";
import { Users, ReceiptText, ChevronRight, Shield } from "lucide-react";
import { formatBohr, formatDateTime } from "@/utils/format";
import { BOTCHAIN_CURRENCY_SYMBOL } from "@/config/network";

interface GroupCardProps {
  id: bigint;
  name: string;
  description: string;
  admin: string;
  createdAt: bigint;
  totalSpending: bigint;
  memberCount: bigint;
  expenseCount: bigint;
  currentUser?: string;
}

export function GroupCard({
  id,
  name,
  description,
  admin,
  createdAt,
  totalSpending,
  memberCount,
  expenseCount,
  currentUser,
}: GroupCardProps) {
  const isAdmin = currentUser && admin.toLowerCase() === currentUser.toLowerCase();

  return (
    <Link
      href={`/group/${id.toString()}`}
      className="group block rounded-2xl bg-charcoal-850 border border-charcoal-700/70 p-5 hover:border-brand-purple/60 hover:bg-charcoal-800/90 transition-all shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-gray-100 group-hover:text-brand-purple-light transition-colors">
              {name}
            </h3>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-purple/15 text-brand-purple-light border border-brand-purple/30">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="p-1.5 rounded-xl bg-charcoal-800 text-gray-400 group-hover:text-brand-purple-light group-hover:bg-charcoal-700 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-charcoal-700/60 grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-[11px] text-gray-400 block mb-0.5">Total Spent</span>
          <span className="font-semibold text-gray-200 font-mono">
            {formatBohr(totalSpending)} {BOTCHAIN_CURRENCY_SYMBOL}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-400 block mb-0.5 flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-400" />
            Members
          </span>
          <span className="font-semibold text-gray-200 font-mono">
            {memberCount.toString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-400 block mb-0.5 flex items-center gap-1">
            <ReceiptText className="w-3 h-3 text-gray-400" />
            Expenses
          </span>
          <span className="font-semibold text-gray-200 font-mono">
            {expenseCount.toString()}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
        <span>ID #{id.toString()}</span>
        <span>Created {formatDateTime(createdAt)}</span>
      </div>
    </Link>
  );
}

