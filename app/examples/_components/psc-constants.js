/**
 * Protocol Smart Contract Constants
 * Canonical addresses and gas costs for all Vitruveo PSCs
 */

export const PSC_ADDRESSES = {
  HOST: '0x0000000000000000000000000000000000000099',
  PASSKEY: '0x00000000000000000000000000000000000000AA',
  SHUFFLE: '0x00000000000000000000000000000000000000AB',
  BATCH_BALANCE: '0x00000000000000000000000000000000000000BB',
  BATCH_BALANCE_NATIVE: '0x00000000000000000000000000000000000000BC',
  COMPOUND_INTEREST: '0x00000000000000000000000000000000000000CC',
  MERKLE_PROOF: '0x00000000000000000000000000000000000000DD',
  BATCH_SEND_ERC20: '0x00000000000000000000000000000000000000EE',
  BATCH_SEND_NATIVE: '0x00000000000000000000000000000000000000EC',
  RNG: '0x00000000000000000000000000000000000000FF',
  IBC: '0x00000000000000000000000000000000000001BC',
  TREND: '0x00000000000000000000000000000000000000DC',
};

export const PSC_GAS = {
  HOST: { base: 25000, description: 'Base cost for HOST request' },
  PASSKEY: { base: 3450, description: 'P-256 signature verification' },
  SHUFFLE: { base: 5000, description: 'Fisher-Yates 52-card shuffle' },
  BATCH_BALANCE: { base: 100, perToken: 30000, description: 'ERC20 balance queries' },
  BATCH_BALANCE_NATIVE: { base: 100, perToken: 30000, description: 'Native + ERC20 balance queries' },
  COMPOUND_INTEREST: { base: 500, perBit: 60, perMul: 40, description: 'Compound interest calculation' },
  MERKLE_PROOF: { base: 1000, perHash: 50, description: 'Merkle proof verification' },
  BATCH_SEND_ERC20: { base: 200, perTransfer: 50000, description: 'Multi-recipient ERC20 transfer' },
  BATCH_SEND_NATIVE: { base: 200, perTransfer: 50000, description: 'Multi-recipient native transfer' },
  RNG: { base: 500, description: 'Random number generation' },
  IBC: {
    createClient: 100000,
    updateClient: 200000,
    getState: 3000,
    verifyMembership: 50000,
    description: 'Cosmos IBC light client operations'
  },
  TREND: { perByte: 20, description: 'OLS regression + volatility analysis' },
};

export const HOST_REGISTRY_ADDRESS = '0xbdc8a59Ec92065848D0a6591F1a67Ce09D5E5FA7';

export const NETWORK_CONFIG = {
  chainId: 1490,
  name: 'Vitruveo',
  rpc: 'https://rpc.vitruveo.ai',
  explorer: 'https://explorer.vitruveo.ai',
  blockTime: 5,
  gasPrice: 4,
};
