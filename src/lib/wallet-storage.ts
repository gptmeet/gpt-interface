interface StoredWallet {
  address: string;
  seed: string;
}

export const saveWallet = (wallet: StoredWallet) => {
  localStorage.setItem('xrpl-wallet', JSON.stringify(wallet));
};

export const loadWallet = (): StoredWallet | null => {
  const stored = localStorage.getItem('xrpl-wallet');
  return stored ? JSON.parse(stored) : null;
};

export const clearWallet = () => {
  localStorage.removeItem('xrpl-wallet');
}; 