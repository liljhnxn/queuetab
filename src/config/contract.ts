import { QUEUETAB_ABI } from "./abi";
import { botchainTestnet } from "./network";

export const QUEUETAB_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const queuetabContractConfig = {
  address: QUEUETAB_CONTRACT_ADDRESS,
  abi: QUEUETAB_ABI,
  chainId: botchainTestnet.id,
} as const;

