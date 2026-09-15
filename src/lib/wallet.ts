import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from 'viem';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
export const walletConfigured = Boolean(projectId);

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Chain Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
});

export const wagmiAdapter = projectId
  ? new WagmiAdapter({
      projectId,
      networks: [robinhoodChain],
    })
  : null;

export const appKit = projectId && wagmiAdapter ? createAppKit({
  adapters: [wagmiAdapter],
  networks: [robinhoodChain],
  defaultNetwork: robinhoodChain,
  projectId,
  metadata: {
    name: 'Isogate Verification Network',
    description: 'Wallet access for the Isogate CPU Console',
    url: window.location.origin,
    icons: [],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
}) : null;