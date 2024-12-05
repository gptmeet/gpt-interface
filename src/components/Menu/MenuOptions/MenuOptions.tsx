import React, { useState, useEffect } from 'react';
import useStore from '@store/store';
import { saveWallet, loadWallet } from '@lib/wallet-storage';
import { getBalances } from '@lib/xrpl-client';
import { Wallet } from 'xrpl';

import CollapseOptions from './CollapseOptions';
import GoogleSync from '@components/GoogleSync';
import { TotalTokenCostDisplay } from '@components/SettingsMenu/TotalTokenCost';
import PersonIcon from '@icon/PersonIcon';
import SettingsMenu from '@components/SettingsMenu';
import WalletModal from '@components/WalletModal/WalletModal';
import WalletDetailsModal from '@components/WalletModal/WalletDetailsModal';
import EyeIcon from '@icon/EyeIcon';
import SendTokenModal from '@components/WalletModal/SendTokenModal';
import { 
  XRP_LOGO_URL,
  AIDA_LOGO_URL,
  XRP_TO_CREDITS,
  AIDA_TO_CREDITS,
  XRP_USD_RATE,
  AIDA_USD_RATE 
} from '@lib/token-constants';
import WalletIcon from '@icon/WalletIcon';
import SendIcon from '@icon/SendIcon';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

const MenuOptions = () => {
  const hideMenuOptions = useStore((state) => state.hideMenuOptions);
  const countTotalTokens = useStore((state) => state.countTotalTokens);
  const setPaymentToken = useStore((state) => state.setPaymentToken);
  const paymentToken = useStore((state) => state.paymentToken);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [xrpBalance, setXrpBalance] = useState('0.00');
  const [xrpUsdValue, setXrpUsdValue] = useState('0.00');
  const [aidaBalance, setAidaBalance] = useState('0.00');
  const [aidaUsdValue, setAidaUsdValue] = useState('0.00');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);
  const [showCopiedAddress, setShowCopiedAddress] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  // Load wallet on mount
  useEffect(() => {
    const storedWallet = loadWallet();
    if (storedWallet) {
      try {
        const loadedWallet = Wallet.fromSeed(storedWallet.seed);
        setWalletAddress(storedWallet.address);
        setSeed(storedWallet.seed);
        setWallet(loadedWallet);
        useStore.getState().setWallet(loadedWallet);
      } catch (err) {
        console.error('Failed to load wallet:', err);
      }
    }
  }, []);

  // Fetch balances when wallet is connected
  useEffect(() => {
    if (!walletAddress || walletAddress === 'r...') return;

    const fetchBalances = async () => {
      try {
        console.log('Fetching balances for wallet:', walletAddress);
        const balances = await getBalances(walletAddress);
        console.log('Received balances:', balances);
        
        useStore.getState().setXrpBalance(balances.xrp.toString());
        useStore.getState().setAidaBalance(balances.aida.toString());
        
        setXrpBalance(balances.xrp.toString());
        setAidaBalance(balances.aida.toString());
        
        const xrpUsd = balances.xrp * XRP_USD_RATE;
        const aidaUsd = balances.aida * AIDA_USD_RATE;
        
        setXrpUsdValue(xrpUsd.toFixed(2));
        setAidaUsdValue(aidaUsd.toFixed(2));
        
        console.log('Updated state:', {
          xrp: balances.xrp.toString(),
          aida: balances.aida.toString(),
          xrpUsd: xrpUsd.toFixed(2),
          aidaUsd: aidaUsd.toFixed(2)
        });
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const handleConnectWallet = () => {
    alert('Connect Wallet button clicked');
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length <= 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setShowCopiedAddress(true);
      setTimeout(() => setShowCopiedAddress(false), 2000);
    }
  };

  const togglePaymentToken = () => {
    const newToken = paymentToken === 'XRP' ? 'AIDA' : 'XRP';
    setPaymentToken(newToken);
  };

  const handleCreateOrImportWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleWalletCreated = (address: string, seed: string) => {
    try {
      const newWallet = Wallet.fromSeed(seed);
      setWalletAddress(address);
      setSeed(seed);
      setWallet(newWallet);
      useStore.getState().setWallet(newWallet);
      saveWallet({ address, seed });
      setIsWalletModalOpen(false);
    } catch (err) {
      console.error('Failed to create wallet:', err);
    }
  };

  const handleWalletButtonClick = () => {
    if (walletAddress) {
      // If wallet exists, open wallet details
      setIsDetailsModalOpen(true);
    } else {
      // If no wallet, open create/import modal
      setIsWalletModalOpen(true);
    }
  };

  return (
    <>
      <CollapseOptions />
      <div className={`${hideMenuOptions ? 'max-h-0' : 'max-h-full'} overflow-hidden transition-all`}>
        
        <div className="py-2">
          <button 
            className='btn-primary w-full flex items-center justify-center gap-2' 
            onClick={handleWalletButtonClick}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
              />
            </svg>
            {walletAddress ? 'View Wallet' : 'Create/Import Wallet'}
          </button>
        </div>

        {walletAddress && walletAddress !== 'r...' && (
          <>
            <div className="bg-gray-800 p-2 rounded-md flex items-center gap-2 mb-2">
              <div className="bg-purple-600 p-1 rounded-full text-white flex items-center justify-center">
                <PersonIcon />
              </div>
              <div className="flex-1">
                <div className="text-white text-xs">My Wallet</div>
                <div className="relative">
                  <div 
                    className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={handleCopyAddress}
                  >
                    {truncateAddress(walletAddress)}
                  </div>
                  {showCopiedAddress && (
                    <span className="absolute right-0 text-green-400 text-xs">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSendModalOpen(true)}
                  className="p-2 hover:bg-gray-700 rounded-md text-white hover:text-purple-300"
                >
                  <SendIcon />
                </button>
                <button 
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="p-2 hover:bg-gray-700 rounded-md text-white hover:text-purple-300"
                >
                  <WalletIcon />
                </button>
                <SettingsMenu />
              </div>
            </div>

            <div className="bg-gray-800 p-2 rounded-md mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-xs">Pay with:</span>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded flex items-center gap-2 ${
                      paymentToken === 'XRP' ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                    onClick={() => setPaymentToken('XRP')}
                  >
                    <img src={XRP_LOGO_URL} alt="XRP Logo" className="w-5 h-5" />
                    <span className="text-white text-xs">XRP</span>
                  </button>
                  <button
                    className={`px-3 py-1 rounded flex items-center gap-2 ${
                      paymentToken === 'AIDA' ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                    onClick={() => setPaymentToken('AIDA')}
                  >
                    <img src={AIDA_LOGO_URL} alt="AIDA Logo" className="w-4 h-4" />
                    <span className="text-white text-xs">AIDA</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img 
                  src={paymentToken === 'XRP' ? XRP_LOGO_URL : AIDA_LOGO_URL} 
                  alt={`${paymentToken} Logo`} 
                  className={`${paymentToken === 'XRP' ? 'w-5 h-5' : 'w-4 h-4'}`}
                />
                <div className="flex-1">
                  <div className="text-white text-xs">
                    {paymentToken === 'XRP' ? xrpBalance : aidaBalance} ${paymentToken}
                  </div>
                  <div className="text-gray-500 text-xs">
                    ${paymentToken === 'XRP' ? xrpUsdValue : aidaUsdValue}
                  </div>
                  <div className="text-gray-500 text-xs">
                    1 ${paymentToken} = {paymentToken === 'XRP' ? XRP_TO_CREDITS.toLocaleString() : AIDA_TO_CREDITS.toLocaleString()} API Credits
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {countTotalTokens && <TotalTokenCostDisplay />}
        {googleClientId && <GoogleSync clientId={googleClientId} />}

      </div>

      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletCreated={handleWalletCreated}
      />

      {wallet && walletAddress && (
        <WalletDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          address={walletAddress}
          seed={seed}
          balance={{
            xrp: xrpBalance,
            aida: aidaBalance
          }}
          wallet={wallet}
        />
      )}

      {wallet && walletAddress && (
        <SendTokenModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          balance={{
            xrp: xrpBalance,
            aida: aidaBalance
          }}
          wallet={wallet}
          sourceAddress={walletAddress}
        />
      )}
    </>
  );
};

export default MenuOptions;
