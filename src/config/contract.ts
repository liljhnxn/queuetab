import { QUEUETAB_ABI } from "./abi";
import { botchain } from "./network";

export const QUEUETAB_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x9CE13d9FaCe9BB83B5EBeE3993b741ce378C7EdB") as `0x${string}`;

export const queuetabContractConfig = {
  address: QUEUETAB_CONTRACT_ADDRESS,
  abi: QUEUETAB_ABI,
  chainId: botchain.id,
} as const;
