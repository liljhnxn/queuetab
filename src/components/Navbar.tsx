"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { shortenAddress } from "@/utils/format";
import { BOTCHAIN_CHAIN_ID } from "@/config/network";
import { Wallet, LogOut, AlertTriangle, Layers, ChevronDown } from "lucide-react";

export function Navbar() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isWrongNetwork = isConnected && chain?.id !== BOTCHAIN_CHAIN_ID;

  const handleConnect = () => {
    // Find injected or metaMask connector
    const connector = connectors.find((c) => c.name.toLowerCase().includes("metamask")) || connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-700/60 bg-charcoal-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-purple-dark p-0.5 shadow-lg shadow-brand-purple/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-charcoal-900 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-brand-purple-light" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-100 tracking-tight group-hover:text-brand-purple-light transition-colors">
                QueueTab
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded bg-charcoal-700 text-gray-400 border border-charcoal-600">
                Testnet
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              On-Chain Group Expense Tracker
            </p>
          </div>
        </Link>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Wrong Network Warning */}
          {isWrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: BOTCHAIN_CHAIN_ID })}
              disabled={isSwitching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSwitching ? "Switching..." : "Switch to Botchain"}</span>
            </button>
          )}

          {/* Network Indicator (if on correct network) */}
          {isConnected && !isWrongNetwork && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-800/80 border border-charcoal-700/80 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span>Botchain Testnet (968)</span>
            </div>
          )}

          {/* Wallet Button */}
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700/80 border border-charcoal-700 text-gray-200 text-sm font-medium transition-colors shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-brand-purple" />
                <span className="font-mono">{shortenAddress(address)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-charcoal-850 border border-charcoal-700 shadow-xl py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-charcoal-700/70">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                      Connected Wallet
                    </p>
                    <p className="font-mono text-xs text-gray-200 truncate mt-0.5">
                      {address}
                    </p>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:bg-charcoal-700/50 transition-colors text-xs font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-sm font-medium transition-all shadow-md shadow-brand-purple/20 hover:shadow-brand-purple/30 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

