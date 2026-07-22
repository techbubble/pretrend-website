'use client';

import { useState } from 'react';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

export const vitruveo = defineChain({
  id: 1490,
  name: 'Vitruveo',
  nativeCurrency: { name: 'VTRU', symbol: 'VTRU', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.vitruveo.ai'] } },
  blockExplorers: { default: { name: 'Vitruveo Explorer', url: 'https://explorer.vitruveo.xyz' } },
});

// Same public WalletConnect client id the validators config uses.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c86913c1e4403a33af0a51d8d3e39334';

// Vitruveo is the only supported network for the game.
const gameWagmiConfig = getDefaultConfig({
  appName: 'TrendPulse',
  projectId,
  chains: [vitruveo],
  ssr: true,
});

export function GameProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={gameWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={vitruveo}
          theme={darkTheme({ accentColor: '#7abe4d', accentColorForeground: '#0a0f0a' })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
