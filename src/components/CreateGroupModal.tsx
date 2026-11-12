"use client";

import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { QUEUETAB_ABI } from "@/config/abi";
import { QUEUETAB_CONTRACT_ADDRESS } from "@/config/contract";
import { X, Loader2, PlusCircle, AlertCircle } from "lucide-react";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Please enter a group name.");
      return;
    }
    setValidationError("");

    writeContract({
      address: QUEUETAB_CONTRACT_ADDRESS,
      abi: QUEUETAB_ABI,
      functionName: "createGroup",
      args: [name.trim(), description.trim()],
    });
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setValidationError("");
    reset();
    onClose();
  };

  // If transaction succeeded
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
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-100">Create Expense Group</h3>
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
              ✓ Group created successfully on BOT Chain Mainnet!
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Group Name <span className="text-brand-purple">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError("");
              }}
              disabled={isBusy}
              placeholder="e.g. Kyoto Trip, Apartment 4B, Friday Dinner"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 focus:border-brand-purple focus:outline-none text-sm text-gray-100 placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Description <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBusy}
              rows={3}
              placeholder="Shared expenses for accommodation, dining, and travel..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 focus:border-brand-purple focus:outline-none text-sm text-gray-100 placeholder:text-gray-500 disabled:opacity-50 resize-none"
            />
          </div>

          <p className="text-[11px] text-gray-400">
            You will automatically become the group administrator and first member. You can add more members by their wallet address.
          </p>

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
              disabled={isBusy || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold transition-all shadow-md shadow-brand-purple/20 disabled:opacity-50"
            >
              {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Confirm in Wallet..."
                  : isConfirming
                  ? "Confirming on-chain..."
                  : "Create Group"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

