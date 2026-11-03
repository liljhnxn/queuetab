import { defineChain } from "viem";

export const BOTCHAIN_CHAIN_ID = 968;
export const BOTCHAIN_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life";
export const BOTCHAIN_EXPLORER_URL = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "https://scan.bohr.life";
export const BOTCHAIN_CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "BOHR";

export const botchainTestnet = defineChain({
  id: BOTCHAIN_CHAIN_ID,
  name: "Botchain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOHR",
    symbol: "BOHR",
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
  testnet: true,
});

