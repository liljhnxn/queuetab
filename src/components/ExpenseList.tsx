import React from "react";
import { formatBohr, formatDateTime, shortenAddress } from "@/utils/format";
import { Receipt, Calendar, Users, User } from "lucide-react";
import { BOTCHAIN_CURRENCY_SYMBOL } from "@/config/network";

export interface ExpenseRecord {
  id: bigint;
  groupId: bigint;
  title: string;
  description: string;
  amount: bigint;
  recordedBy: string;
  timestamp: bigint;
  memberCountAtRecording: bigint;
  splitAmountPerMember: bigint;
}

interface ExpenseListProps {
  expenses: ExpenseRecord[];
  currentUser?: string;
}

export function ExpenseList({ expenses, currentUser }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/60 p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto mb-3 text-gray-500">
          <Receipt className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-gray-200">No Expenses Recorded</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Group members can record shared expenses at any time. Each expense will be split equally among all members.
        </p>
      </div>
    );
  }

  // Display newest expenses first
  const sorted = [...expenses].reverse();

  return (
    <div className="space-y-3">
      {sorted.map((exp) => {
        const isPayer = currentUser && exp.recordedBy.toLowerCase() === currentUser.toLowerCase();

        return (
          <div
            key={exp.id.toString()}
            className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 p-4 sm:p-5 hover:border-charcoal-600 transition-all shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-brand-purple flex-shrink-0 mt-0.5 sm:mt-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-gray-100">
                      {exp.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono px-1.5 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">
                      #{exp.id.toString()}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-400 mt-1">
                      {exp.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 font-mono">
                      <User className="w-3 h-3 text-gray-400" />
                      Paid by {shortenAddress(exp.recordedBy)}
                      {isPayer && (
                        <span className="text-brand-purple-light font-sans font-medium">
                          (You)
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDateTime(exp.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-charcoal-700/50 flex sm:flex-col justify-between items-baseline sm:items-end">
                <div>
                  <div className="text-sm sm:text-base font-bold font-mono text-gray-100">
                    {formatBohr(exp.amount)} {BOTCHAIN_CURRENCY_SYMBOL}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-brand-green font-mono">
                    <Users className="w-3 h-3" />
                    <span>
                      {formatBohr(exp.splitAmountPerMember)} / member ({exp.memberCountAtRecording.toString()} members)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

