"use client";

import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { QUEUETAB_ABI } from "@/config/abi";
import { QUEUETAB_CONTRACT_ADDRESS } from "@/config/contract";
import { X, Loader2, Receipt, AlertCircle, Info } from "lucide-react";

interface RecordExpenseModalProps {
  groupId: bigint;
  memberCount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordExpenseModal({
  groupId,
  memberCount,
  isOpen,
  onClose,
  onSuccess,
}: RecordExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const {
    data: txHash,
    isPending: isSubmitting,
    error: writeError,
    writeContract,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const parsedAmountWei = React.useMemo(() => {
    try {
      const val = parseFloat(amountInput);
      if (isNaN(val) || val <= 0) return 0n;
      return parseEther(amountInput);
    } catch {
      return 0n;
    }
  }, [amountInput]);

  const splitEstimate = React.useMemo(() => {
    if (!parsedAmountWei || memberCount === 0) return "0.00";
    const splitWei = parsedAmountWei / BigInt(memberCount);
    const splitNum = Number(splitWei) / 1e18;
    return splitNum.toFixed(4);
  }, [parsedAmountWei, memberCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Please enter an expense title.");
      return;
    }
    if (!amountInput || parsedAmountWei <= 0n) {
      setValidationError("Please enter a valid expense amount greater than 0.");
      return;
    }
    setValidationError("");

    writeContract({
      address: QUEUETAB_CONTRACT_ADDRESS,
      abi: QUEUETAB_ABI,
      functionName: "recordExpense",
      args: [groupId, title.trim(), description.trim(), parsedAmountWei],
    });
  };

  const handleClose = () => {
    setTitle("");
    setAmountInput("");
    setDescription("");
    setValidationError("");
    reset();
    onClose();
  };

  React.useEffect(() => {
    if (isSuccess) {
      if (onSuccess) onSuccess();
      const timer = setTimeout(() => {
        handleClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (!isOpen) return null;

  const isBusy = isSubmitting || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-charcoal-850 border border-charcoal-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-700/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-purple/10 text-brand-purple">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-100">Record Shared Expense</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isBusy}
            className="text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {writeError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="break-words max-h-24 overflow-y-auto">
                {writeError.message.includes("User rejected")
                  ? "Transaction cancelled by user in MetaMask."
                  : writeError.message.slice(0, 160)}
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green-light text-xs font-medium text-center">
              ✓ Expense recorded and split on Botchain!
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Expense Title <span className="text-brand-purple">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError("");
              }}
              disabled={isBusy}
              placeholder="e.g. Airbnb Booking, Dinner, Groceries"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 focus:border-brand-purple focus:outline-none text-sm text-gray-100 placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Amount (BOHR) <span className="text-brand-purple">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.000000000000000001"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (validationError) setValidationError("");
                }}
                disabled={isBusy}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 focus:border-brand-purple focus:outline-none text-sm font-mono text-gray-100 placeholder:text-gray-500 disabled:opacity-50 pr-16"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-mono font-medium text-gray-400 pointer-events-none">
                BOHR
              </span>
            </div>
          </div>

          {/* Equal Distribution Calculation Preview */}
          {parsedAmountWei > 0n && (
            <div className="p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 text-xs">
              <div className="flex items-center justify-between text-gray-300 mb-1">
                <span>Split among {memberCount} {memberCount === 1 ? "member" : "members"}:</span>
                <span className="font-mono font-semibold text-brand-green">
                  ~{splitEstimate} BOHR / member
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                You will be credited as payer, and each member owes an equal fraction.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Notes / Description <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBusy}
              rows={2}
              placeholder="Breakdown notes or receipt details..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 focus:border-brand-purple focus:outline-none text-sm text-gray-100 placeholder:text-gray-500 disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-charcoal-800/50 border border-charcoal-700/40 text-[11px] text-gray-400">
            <Info className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" />
            <span>
              <strong>Accounting Only:</strong> This records the entry on the smart contract. It does not transfer tokens or request funds from any wallet.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy || !title.trim() || parsedAmountWei <= 0n}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold transition-all shadow-md shadow-brand-purple/20 disabled:opacity-50"
            >
              {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Confirm in Wallet..."
                  : isConfirming
                  ? "Recording..."
                  : "Record Expense"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

