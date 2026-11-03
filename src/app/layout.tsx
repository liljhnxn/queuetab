import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "QueueTab | On-Chain Group Expense Tracker",
  description:
    "Decentralized group expense tracking ledger on Botchain Testnet. Split costs transparently without financial intermediaries.",
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
          <footer className="border-t border-charcoal-800 bg-charcoal-900/60 py-6 text-center text-xs text-gray-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-300">QueueTab</span>
                <span>•</span>
                <span>Botchain Testnet (Chain ID 968)</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Non-custodial expense ledger. No funds are held, managed, or transferred.
              </p>
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}

