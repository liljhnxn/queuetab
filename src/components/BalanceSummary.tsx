import React from "react";
import { formatBohr, shortenAddress } from "@/utils/format";
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, User } from "lucide-react";

interface BalanceItem {
  address: string;
  paid: bigint;
  owed: bigint;
  net: bigint;
}

interface BalanceSummaryProps {
  balances: BalanceItem[];
  currentUser?: string;
  adminAddress?: string;
}

export function BalanceSummary({
  balances,
  currentUser,
  adminAddress,
}: BalanceSummaryProps) {
  if (balances.length === 0) {
    return (
      <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/60 p-8 text-center text-gray-400">
        <p className="text-sm">No member balances recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-charcoal-850 border border-charcoal-700/70 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-charcoal-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-100 text-base">
            Member Balance Summary
          </h3>
          <p className="text-xs text-gray-400">
            Net balance = Total Paid − Share Owed
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand-green" /> Overpaid / Credited
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Owes Group
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> Settled
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal-700/60 bg-charcoal-900/60 text-gray-400 font-medium uppercase tracking-wider">
              <th className="px-6 py-3.5">Member</th>
              <th className="px-6 py-3.5 font-mono">Total Paid</th>
              <th className="px-6 py-3.5 font-mono">Share Owed</th>
              <th className="px-6 py-3.5 font-mono">Net Balance</th>
              <th className="px-6 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-700/50">
            {balances.map((item) => {
              const isCurrent = currentUser && item.address.toLowerCase() === currentUser.toLowerCase();
              const isAdmin = adminAddress && item.address.toLowerCase() === adminAddress.toLowerCase();
              const net = item.net;
              const isPositive = net > 0n;
              const isNegative = net < 0n;
              const isZero = net === 0n;

              const absNet = isNegative ? -net : net;

              return (
                <tr
                  key={item.address}
                  className={`hover:bg-charcoal-800/50 transition-colors ${
                    isCurrent ? "bg-brand-purple/5" : ""
                  }`}
                >
                  {/* Member Address */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-gray-300">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono text-gray-200">
                          <span>{shortenAddress(item.address, 6)}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 font-sans">
                              You
                            </span>
                          )}
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-charcoal-700 text-gray-300 border border-charcoal-600 font-sans">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono truncate max-w-[200px] hidden sm:block">
                          {item.address}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Total Paid */}
                  <td className="px-6 py-4 font-mono font-medium text-gray-200">
                    {formatBohr(item.paid)} BOHR
                  </td>

                  {/* Share Owed */}
                  <td className="px-6 py-4 font-mono font-medium text-gray-200">
                    {formatBohr(item.owed)} BOHR
                  </td>

                  {/* Net Balance */}
                  <td className="px-6 py-4 font-mono font-semibold">
                    {isPositive && (
                      <span className="text-brand-green flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{formatBohr(absNet)} BOHR
                      </span>
                    )}
                    {isNegative && (
                      <span className="text-rose-400 flex items-center gap-1">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        -{formatBohr(absNet)} BOHR
                      </span>
                    )}
                    {isZero && (
                      <span className="text-gray-400 flex items-center gap-1">
                        0.00 BOHR
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 text-right">
                    {isPositive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-brand-green/10 text-brand-green-light border border-brand-green/30">
                        Paid More (+{formatBohr(absNet)})
                      </span>
                    )}
                    {isNegative && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        Owes Money ({formatBohr(absNet)})
                      </span>
                    )}
                    {isZero && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-charcoal-700 text-gray-300 border border-charcoal-600">
                        <CheckCircle2 className="w-3 h-3 text-gray-400" />
                        Settled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

