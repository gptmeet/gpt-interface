import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import useStore from '@store/store';

import CollapseOptions from './CollapseOptions';
import GoogleSync from '@components/GoogleSync';
import { TotalTokenCostDisplay } from '@components/SettingsMenu/TotalTokenCost';
import PersonIcon from '@icon/PersonIcon';
import SettingIcon from '@icon/SettingIcon';
import SettingsMenu from '@components/SettingsMenu';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;
const solLogoUrl = 'https://cryptologos.cc/logos/solana-sol-logo.png';
const meetLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Google_Meet_icon_%282020%29.svg/2491px-Google_Meet_icon_%282020%29.svg.png';

const RAY_TOKEN_ADDRESS = 'RAY_TOKEN_ADDRESS'; // Replace with actual RAY token address
const SOLANA_RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

const TREASURY_ADDRESS = 'E8LxfzHutmXWwnaJhP1fqHJmpCWuJgamZptex38zrjLq';

// Add this type declaration for window.solana
declare global {
  interface Window {
    solana?: any;
  }
}

const MenuOptions = () => {
  const hideMenuOptions = useStore((state) => state.hideMenuOptions);
  const countTotalTokens = useStore((state) => state.countTotalTokens);

  // Initialize wallet hook with error handling
  let wallet;
  try {
    wallet = useWallet();
  } catch (error) {
    console.error('Wallet adapter not initialized:', error);
    wallet = { publicKey: null, connected: false };
  }

  const { publicKey, connected } = wallet;
  
  // Initialize connection only if needed
  const connection = connected ? new Connection(SOLANA_RPC_ENDPOINT) : null;

  const [walletAddress, setWalletAddress] = useState('Connect Wallet');
  const [solBalance, setSolBalance] = useState('0.00');
  const [solUsdValue, setSolUsdValue] = useState('0.00');
  const [rayBalance, setRayBalance] = useState('0.00');
  const [rayUsdValue, setRayUsdValue] = useState('0.00');
  const [paymentToken, setPaymentToken] = useState<'SOL' | 'RAY'>('SOL');
  const [creditBalance, setCreditBalance] = useState('0');
  const [creditAmount, setCreditAmount] = useState<string>('');

  const getPhantomProvider = () => {
    if ('solana' in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
    window.open('https://phantom.app/', '_blank');
  };

  useEffect(() => {
    const provider = getPhantomProvider();
    if (!provider) return;

    const fetchBalance = async () => {
      try {
        // Get the connected wallet's public key
        const resp = await provider.connect();
        const publicKey = resp.publicKey.toString();
        
        // Create connection
        const connection = new Connection(SOLANA_RPC_ENDPOINT);
        
        // Get balance
        const balance = await connection.getBalance(new PublicKey(publicKey));
        setSolBalance((balance / LAMPORTS_PER_SOL).toFixed(2));
        
        // Get SOL price
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
          const data = await response.json();
          const solPrice = data.solana.usd;
          setSolUsdValue((balance / LAMPORTS_PER_SOL * solPrice).toFixed(2));
        } catch (error) {
          console.error('Error fetching SOL price:', error);
          setSolUsdValue((balance / LAMPORTS_PER_SOL * 60).toFixed(2)); // Fallback price
        }
      } catch (err) {
        console.error("Error connecting to Phantom:", err);
      }
    };

    // Listen for wallet connection changes
    provider.on("connect", async (publicKey: PublicKey) => {
      console.log("Connected to wallet:", publicKey.toString());
      fetchBalance();
    });

    provider.on("disconnect", () => {
      console.log("Disconnected from wallet");
      setSolBalance('0.00');
      setSolUsdValue('0.00');
    });

    // Initial fetch if already connected
    if (provider.isConnected) {
      fetchBalance();
    }

    return () => {
      provider.disconnect();
    };
  }, []);

  const connectWallet = async () => {
    const provider = getPhantomProvider();
    if (provider) {
      try {
        const resp = await provider.connect();
        console.log("Connected to:", resp.publicKey.toString());
      } catch (err) {
        console.error("Connection failed:", err);
      }
    }
  };

  const handleCopyAddress = () => {
    if (connected && publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      alert('Address copied to clipboard');
    }
  };

  const handleBuyCredits = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Create a new connection with commitment level
      const connection = new Connection(SOLANA_RPC_ENDPOINT, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000, // 60 seconds
      });

      const treasuryPublicKey = new PublicKey(TREASURY_ADDRESS);
      
      let amount: number;
      if (paymentToken === 'SOL') {
        amount = Number(creditAmount) * 0.000001 * LAMPORTS_PER_SOL;
      } else {
        alert('RAY payments coming soon!');
        return;
      }

      console.log('Creating transaction...');
      const transaction = new Transaction();

      // Get latest blockhash with retry logic
      let blockhash;
      let lastValidBlockHeight;
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`Attempting to get blockhash (attempt ${i + 1})...`);
          const { blockhash: newBlockhash, lastValidBlockHeight: newLastValidBlockHeight } = 
            await connection.getLatestBlockhash('finalized');
          blockhash = newBlockhash;
          lastValidBlockHeight = newLastValidBlockHeight;
          break;
        } catch (error) {
          console.error(`Failed to get blockhash (attempt ${i + 1}):`, error);
          if (i === 2) throw new Error('Failed to get blockhash after 3 attempts');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPublicKey,
          lamports: Math.floor(amount),
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      try {
        console.log('Requesting signature...');
        if (!window.solana) {
          throw new Error('Solana object not found! Get Phantom wallet');
        }
        const signedTx = await window.solana.signTransaction(transaction);
        
        console.log('Broadcasting transaction...');
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        
        console.log('Confirming transaction...');
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
        }

        console.log('Transaction successful!');
        alert(`Successfully purchased ${creditAmount} credits!\nTransaction: ${signature}`);

      } catch (error: any) { // Type the error as any for now
        console.error('Transaction error:', error);
        if (error?.message?.includes('User rejected')) {
          alert('Transaction cancelled by user');
        } else {
          alert('Transaction failed: ' + (error as Error).message);
        }
      }

    } catch (error: any) { // Type the error as any for now
      console.error('Setup error:', error);
      if (error?.message?.includes('blockhash')) {
        alert('Network error: Please try again in a few moments');
      } else {
        alert('Failed to setup transaction: ' + (error as Error).message);
      }
    }
  };

  const togglePaymentToken = () => {
    setPaymentToken(prev => prev === 'SOL' ? 'RAY' : 'SOL');
  };

  const handleCreditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || Number(value) >= 0) {
      setCreditAmount(value);
    }
  };

  return (
    <>
      <CollapseOptions />
      <div className={`${hideMenuOptions ? 'max-h-0' : 'max-h-full'} overflow-hidden transition-all`}>
        {connected && (
          <>
            <div className="bg-gray-800 p-2 rounded-md flex items-center gap-2 mb-2">
              <div className="flex-1">
                <WalletMultiButton className='bg-transparent hover:bg-transparent border-0 outline-none text-left p-0 text-xs' />
              </div>
              <SettingsMenu />
            </div>

            <div className="bg-gray-800 p-2 rounded-md mb-2">
              <div className="flex items-center gap-2">
                <img src={solLogoUrl} alt="SOL Logo" className="w-4 h-4" />
                <div className="flex-1">
                  <div className="text-white text-xs">{solBalance} SOL</div>
                  <div className="text-gray-500 text-xs">${solUsdValue}</div>
                </div>
                <a href="https://jup.ag" target="_blank" rel="noopener noreferrer">
                  <svg className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </a>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <img src={meetLogoUrl} alt="RAY Logo" className="w-4 h-4" />
                <div className="flex-1">
                  <div className="text-white text-xs">{rayBalance} RAY</div>
                  <div className="text-gray-500 text-xs">${rayUsdValue}</div>
                </div>
                <a href="https://jup.ag" target="_blank" rel="noopener noreferrer">
                  <svg className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-gray-800 p-2 rounded-md mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-xs">Credit Balance:</div>
                <div className="text-purple-500 font-bold text-xs">{creditBalance} Credits</div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <span className="text-white text-xs">Pay with:</span>
                  <button 
                    onClick={togglePaymentToken}
                    className="flex items-center gap-2 bg-gray-600 px-3 py-1 rounded hover:bg-gray-500"
                  >
                    <img 
                      src={paymentToken === 'SOL' ? solLogoUrl : meetLogoUrl} 
                      alt={`${paymentToken} Logo`} 
                      className="w-4 h-4"
                    />
                    <span className="text-white text-xs">${paymentToken}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-white text-xs">Amount of Credits:</label>
                  <input
                    type="number"
                    className="text-gray-800 dark:text-white p-2 text-xs bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-opacity m-0 w-full h-full focus:outline-none rounded border border-white/20"
                    value={creditAmount}
                    onChange={handleCreditAmountChange}
                    placeholder="Enter amount of credits"
                    min="0"
                  />
                  {paymentToken === 'RAY' && (
                    <div className="text-gray-500 text-xs">
                      ≈ {(Number(creditAmount || 0) / 200000).toFixed(4)} $RAY
                    </div>
                  )}
                  {paymentToken === 'SOL' && (
                    <div className="text-gray-500 text-xs">
                      ≈ {(Number(creditAmount || 0) * 0.000001).toFixed(4)} $SOL
                    </div>
                  )}
                </div>
                
                <button 
                  className="btn-primary flex items-center justify-center gap-2" 
                  onClick={handleBuyCredits}
                  disabled={!creditAmount || Number(creditAmount) <= 0}
                >
                  <span>Buy Credits</span>
                </button>
              </div>
            </div>

            {countTotalTokens && <TotalTokenCostDisplay />}
            {googleClientId && <GoogleSync clientId={googleClientId} />}
          </>
        )}
        {!connected && (
          <div className="bg-gray-800 p-2 rounded-md flex items-center gap-2 mb-2">
            <div className="flex-1">
              <WalletMultiButton className='bg-transparent hover:bg-transparent border-0 outline-none text-left p-0 text-xs' />
            </div>
            <SettingsMenu />
          </div>
        )}
      </div>
    </>
  );
};

export default MenuOptions;
