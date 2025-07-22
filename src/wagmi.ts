import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  arbitrumSepolia,
} from "wagmi/chains";
import { type Chain } from "viem";

export const BerachainBepolia = {
  id: 80069,
  name: "Berachain Bepolia",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://bepolia.rpc.berachain.com"] },
  },
  blockExplorers: {
    default: { name: "Bepolia Block Explorer", url: "https://bepolia.beratrail.io/" },
  }
} as const satisfies Chain;

export const wagmiConfig = getDefaultConfig({
  appName: "Prism-Tint Frontend",
  projectId: "a7649e735f89fc5e232cecc7fa1d0675",
  chains: [BerachainBepolia],
  ssr: true,
});
