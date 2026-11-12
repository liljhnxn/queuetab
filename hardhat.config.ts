import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const BOTCHAIN_MAINNET_RPC = process.env.BOTCHAIN_MAINNET_RPC_URL || "https://rpc.botchain.ai";
const BOTCHAIN_TESTNET_RPC = process.env.BOTCHAIN_TESTNET_RPC_URL || "https://rpc.bohr.life";
const rawPrivateKey = process.env.PRIVATE_KEY?.trim();
const formattedPrivateKey = rawPrivateKey
  ? rawPrivateKey.startsWith("0x")
    ? rawPrivateKey
    : `0x${rawPrivateKey}`
  : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      viaIR: true,
      evmVersion: "shanghai",
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainMainnet: {
      url: BOTCHAIN_MAINNET_RPC,
      chainId: 677,
      accounts: formattedPrivateKey ? [formattedPrivateKey] : [],
    },
    botchainTestnet: {
      url: BOTCHAIN_TESTNET_RPC,
      chainId: 968,
      accounts: formattedPrivateKey ? [formattedPrivateKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      botchainMainnet: "none",
      botchainTestnet: "none",
    },
    customChains: [
      {
        network: "botchainMainnet",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
      {
        network: "botchainTestnet",
        chainId: 968,
        urls: {
          apiURL: "https://scan.bohr.life/api",
          browserURL: "https://scan.bohr.life",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
