import { http, createConfig } from "wagmi";
import { injected } from "wagmi";
import { botchain } from "./network";

export const wagmiConfig = createConfig({
  chains: [botchain],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchain.id]: http(botchain.rpcUrls.default.http[0]),
  },
  ssr: true,
});
