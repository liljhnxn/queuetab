import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/Navbar";
import {
  BOTCHAIN_NETWORK_NAME,
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_WEBSITE_URL,
  BOTCHAIN_EXPLORER_URL,
} from "@/config/network";
import { QUEUETAB_CONTRACT_ADDRESS } from "@/config/contract";
import { ExternalLink, ShieldCheck, Globe, Search, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "QueueTab | On-Chain Group Expense Tracker on BOT Chain",
  description:
    "Decentralized group expense tracking ledger on BOT Chain Mainnet. Split costs transparently without financial intermediaries.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-950 text-gray-200 antialiased selection:bg-brand-purple/30 selection:text-white min-h-screen flex flex-col">
        <Web3Provider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Ecosystem & Footer Section */}
          <footer className="border-t border-charcoal-800 bg-charcoal-900/90 backdrop-blur-md pt-8 pb-6 text-xs text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              {/* Top Ecosystem Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-charcoal-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-green p-0.5 shadow-sm">
                    <div className="w-full h-full bg-charcoal-900 rounded-[7px] flex items-center justify-center">
                      <Layers className="w-4 h-4 text-brand-purple-light" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-200 text-sm">
                        QueueTab
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/30">
                        {BOTCHAIN_NETWORK_NAME}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Decentralized, non-custodial shared expense tracker
                    </p>
                  </div>
                </div>

                {/* BOT Chain Ecosystem Links */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 font-medium text-gray-200 mr-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/botchain-logo.png"
                      alt="BOT Chain Logo"
                      className="w-5 h-5 rounded-md object-contain shadow-sm"
                    />
                    <span>BOT Chain Ecosystem:</span>
                  </div>

                  <a
                    href={BOTCHAIN_WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-200 hover:text-white border border-charcoal-700 transition-colors shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/botchain-logo.png"
                      alt="BOT Chain Logo"
                      className="w-4 h-4 rounded-sm object-contain"
                    />
                    <span className="font-medium">BOT Chain Website</span>
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  </a>

                  <a
                    href={BOTCHAIN_EXPLORER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-200 hover:text-white border border-charcoal-700 transition-colors shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/botchain-logo.png"
                      alt="BOT Chain Logo"
                      className="w-4 h-4 rounded-sm object-contain"
                    />
                    <span className="font-medium">BOT Chain Explorer</span>
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  </a>

                  <a
                    href={`${BOTCHAIN_EXPLORER_URL}/address/${QUEUETAB_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Contract</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Chain ID: {BOTCHAIN_CHAIN_ID}</span>
                  <span>•</span>
                  <span>Native Token: BOT</span>
                  <span>•</span>
                  <span className="font-mono truncate max-w-xs sm:max-w-none">
                    Contract: {QUEUETAB_CONTRACT_ADDRESS}
                  </span>
                </div>
                <p>
                  Zero custody ledger. No funds are deposited, held, or transferred.
                </p>
              </div>
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}
