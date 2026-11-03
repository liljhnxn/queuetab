import React from "react";
import { Info, ShieldCheck } from "lucide-react";

export function NoticeBanner() {
  return (
    <div className="rounded-xl bg-charcoal-850/80 border border-charcoal-700/60 p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-brand-purple/10 border border-brand-purple/20 text-brand-purple-light mt-0.5 sm:mt-0 flex-shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-gray-200">
            Accounting Ledger Mode:
          </span>{" "}
          <span className="text-gray-400">
            QueueTab records shared expenses and mathematically divides liabilities among members on-chain.
            <strong className="text-gray-300"> No cryptocurrency is transferred</strong> and no payment gateways are invoked.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green-light font-medium text-[11px] whitespace-nowrap self-end sm:self-auto">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Strictly Non-Custodial</span>
      </div>
    </div>
  );
}

