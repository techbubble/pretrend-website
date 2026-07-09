'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

// BSC is the only configured chain, so RainbowKit shows a "Wrong network"
// switch prompt when the wallet is on anything else.
export default function ConnectWallet() {
  return <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />;
}
