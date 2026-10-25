'use client';

import { useState } from 'react';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

// Purple for Vitruveo, yellow for BNB Chain: the network colors used in the
// nav chip, the access section and RainbowKit's chain picker.
const VITRUVEO_PURPLE = '#8b5cf6';
const BSC_YELLOW = '#f0b90b';
const dotIcon = (color) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="${color}"/><circle cx="14" cy="14" r="6" fill="#04070d" opacity="0.35"/></svg>`)}`;

export const vitruveo = defineChain({
  id: 1490,
  name: 'Vitruveo',
  nativeCurrency: { name: 'VTRU', symbol: 'VTRU', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.vitruveo.ai'] } },
  blockExplorers: { default: { name: 'Vitruveo Explorer', url: 'https://explorer.vitruveo.ai' } },
  iconUrl: dotIcon(VITRUVEO_PURPLE),
  iconBackground: VITRUVEO_PURPLE,
});

const bscChain = { ...bsc, iconUrl: dotIcon(BSC_YELLOW), iconBackground: BSC_YELLOW };

// Same public WalletConnect client id the validators config uses.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c86913c1e4403a33af0a51d8d3e39334';

// Vitruveo hosts the game and the AI Wars NFT; BNB Smart Chain is only used
// to pay for a mini mint of an Archive Shard.
const gameWagmiConfig = getDefaultConfig({
  appName: 'AIWars Trends',
  projectId,
  chains: [vitruveo, bscChain],
  ssr: true,
});

export function GameProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={gameWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={vitruveo}
          theme={darkTheme({ accentColor: VITRUVEO_PURPLE, accentColorForeground: '#ffffff' })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
