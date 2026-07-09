import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc } from 'wagmi/chains';

// WalletConnect Cloud project id. This is a public client identifier (it ships
// in the browser bundle); access is restricted by allowed domains in the
// WalletConnect Cloud dashboard. Override per-environment via
// NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID if needed.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c86913c1e4403a33af0a51d8d3e39334';

// BSC is the only supported network.
export const wagmiConfig = getDefaultConfig({
  appName: 'Vitruveo Validators',
  projectId,
  chains: [bsc],
  ssr: true,
});
