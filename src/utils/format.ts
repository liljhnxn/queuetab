import { formatEther, parseEther } from "viem";

export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBohr(amountWei?: bigint | string | number): string {
  if (amountWei === undefined || amountWei === null) return "0.00";
  try {
    const val = typeof amountWei === "bigint" ? amountWei : BigInt(amountWei.toString());
    const formatted = formatEther(val);
    const [intPart, decPart] = formatted.split(".");
    if (!decPart) return `${intPart}.00`;
    return `${intPart}.${decPart.slice(0, 4)}`;
  } catch {
    return "0.00";
  }
}

export function parseBohr(amountStr: string): bigint {
  try {
    const trimmed = amountStr.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
      return 0n;
    }
    return parseEther(trimmed);
  } catch {
    return 0n;
  }
}

export function formatDateTime(timestamp?: bigint | number): string {
  if (!timestamp) return "Just now";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  if (num === 0) return "Just now";
  const date = new Date(num * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

