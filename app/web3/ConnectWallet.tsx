'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

// Custom-rendered connect button so it matches the nav styling instead of
// RainbowKit's default bold 16px pill. Modals are still RainbowKit's.
export default function ConnectWallet() {
  const style = { fontSize: '0.85rem', fontWeight: 400, whiteSpace: 'nowrap' } as const;

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } as const,
            })}
          >
            {!connected ? (
              <button type="button" className="btn btn-outline-light btn-sm" style={style} onClick={openConnectModal}>
                Connect
              </button>
            ) : chain.unsupported ? (
              <button type="button" className="btn btn-outline-danger btn-sm" style={style} onClick={openChainModal}>
                Wrong network
              </button>
            ) : (
              <button type="button" className="btn btn-outline-light btn-sm" style={style} onClick={openAccountModal}>
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
