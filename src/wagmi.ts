import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  arbitrumSepolia
} from 'wagmi/chains';

export const  wagmiConfig = getDefaultConfig({
  appName: 'Prism-Tint Frontend',
  projectId: 'a7649e735f89fc5e232cecc7fa1d0675',
  chains: [
    arbitrumSepolia,
  ],
  ssr: true,
});