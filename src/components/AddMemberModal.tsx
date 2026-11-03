"use client";

import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import { QUEUETAB_ABI } from "@/config/abi";
import { QUEUETAB_CONTRACT_ADDRESS } from "@/config/contract";
import { X, Loader2, UserPlus, AlertCircle } from "lucide-react";

interface AddMemberModalProps {
  groupId: bigint;
  existingMembers: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddMemberModal({
  groupId,
  existingMembers,
  isOpen,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [addressInput, setAddressInput] = useState("");
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
    const cleanAddress = addressInput.trim();

    if (!cleanAddress) {
      setValidationError("Please enter an Ethereum wallet address.");
      return;
    }

    if (!isAddress(cleanAddress)) {
      setValidationError("Invalid Ethereum address format (must start with 0x and be 42 characters).");
      return;
    }

    if (cleanAddress.toLowerCase() === "0x0000000000000000000000000000000000000000") {
      setValidationError("Cannot add the zero address.");
      return;
    }

    const alreadyMember = existingMembers.some(
      (m) => m.toLowerCase() === cleanAddress.toLowerCase()
    );
    if (alreadyMember) {
      setValidationError("This wallet address is already a member of this group.");
      return;
    }

    setValidationError("");

    writeContract({
      address: QUEUETAB_CONTRACT_ADDRESS,
      abi: QUEUETAB_ABI,
      functionName: "addMember",
      args: [groupId, cleanAddress as `0x${string}`],
    });
  };

  const handleClose = () => {
    setAddressInput("");
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
            <div className="p-1.5 rounded-lg bg-brand-green/10 text-brand-green">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-100">Add Group Member</h3>
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
                  ? "Transaction cancelled by user."
                  : writeError.message.slice(0, 160)}
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green-light text-xs font-medium text-center">
              ✓ Member added successfully on Botchain!
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Wallet Address (0x...) <span className="text-brand-purple">*</span>
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (validationError) setValidationError("");
              }}
              disabled={isBusy}
              placeholder="0x1234567890abcdef1234567890abcdef12345678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 focus:border-brand-green focus:outline-none text-xs font-mono text-gray-100 placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>

          <p className="text-[11px] text-gray-400">
            Adding a member enables them to participate in future expense splits and record group expenses.
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
              disabled={isBusy || !addressInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold transition-all shadow-md shadow-brand-green/20 disabled:opacity-50"
            >
              {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Confirm in Wallet..."
                  : isConfirming
                  ? "Adding Member..."
                  : "Add Member"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

