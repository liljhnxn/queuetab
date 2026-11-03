import { http, createConfig } from "wagmi";
import { injected } from "wagmi";
import { botchainTestnet } from "./network";

export const wagmiConfig = createConfig({
  chains: [botchainTestnet],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchainTestnet.id]: http(botchainTestnet.rpcUrls.default.http[0]),
  },
  ssr: true,
});
