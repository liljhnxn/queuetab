import { defineChain } from "viem";

export const BOTCHAIN_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "677");
export const BOTCHAIN_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai";
export const BOTCHAIN_EXPLORER_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "https://scan.botchain.ai";
export const BOTCHAIN_CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "BOT";
export const BOTCHAIN_NETWORK_NAME = BOTCHAIN_CHAIN_ID === 677 ? "Botchain Mainnet" : "Botchain Testnet";

export const botchain = defineChain({
  id: BOTCHAIN_CHAIN_ID,
  name: BOTCHAIN_NETWORK_NAME,
  nativeCurrency: {
    decimals: 18,
    name: BOTCHAIN_CURRENCY_SYMBOL,
    symbol: BOTCHAIN_CURRENCY_SYMBOL,
  },
  rpcUrls: {
    default: {
      http: [BOTCHAIN_RPC_URL],
    },
    public: {
      http: [BOTCHAIN_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Botchain Explorer",
      url: BOTCHAIN_EXPLORER_URL,
    },
  },
  testnet: BOTCHAIN_CHAIN_ID !== 677,
});

// Backward compatibility alias
export const botchainTestnet = botchain;
