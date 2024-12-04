import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import PopupModal from '@components/PopupModal';
import SendTokenModal from './SendTokenModal';
import { Wallet } from 'xrpl';

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  seed: string | null;
  balance: { xrp: string; aida: string };
  wallet: Wallet | null;
}

const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({
  isOpen,
  onClose,
  address,
  seed,
  balance,
  wallet
}) => {
  const [showSeed, setShowSeed] = useState(false);
  const [showCopiedAddress, setShowCopiedAddress] = useState(false);
  const [showCopiedSeed, setShowCopiedSeed] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const truncateAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setShowCopiedAddress(true);
    setTimeout(() => setShowCopiedAddress(false), 2000);
  };

  const handleCopySeed = () => {
    if (!seed) return;
    navigator.clipboard.writeText(seed);
    setShowCopiedSeed(true);
    setTimeout(() => setShowCopiedSeed(false), 2000);
  };

  const getXRPScanUrl = (address: string) => {
    return `https://xrpscan.com/account/${address}`;
  };

  const handleRemoveWallet = () => {
    if (showRemoveConfirm) {
      // Clear localStorage
      localStorage.clear();
      // Reload the page to reset all state
      window.location.reload();
    } else {
      setShowRemoveConfirm(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <PopupModal
        setIsModalOpen={onClose}
        title="Wallet Details"
        cancelButton={false}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 max-w-2xl w-full mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              Send Tokens
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm">Address:</p>
                <a
                  href={getXRPScanUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View on XRPScan
                  <svg 
                    className="w-3 h-3 inline ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                    />
                  </svg>
                </a>
              </div>
              <span className="text-gray-400 text-xs ml-4">{truncateAddress(address)}</span>
            </div>
            <div 
              className="relative bg-gray-700 p-3 rounded border border-gray-600 text-gray-300 text-sm font-mono cursor-pointer hover:bg-gray-600 transition-all break-all"
              onClick={handleCopyAddress}
            >
              {address}
              {showCopiedAddress && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-xs bg-gray-800 px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-white text-sm mb-2">RECEIVE</p>
              <QRCodeSVG value={address} size={150} className="p-2 bg-white rounded mx-auto" />
            </div>
          </div>

          {seed && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm">Secret Key:</p>
                <button
                  onClick={() => setShowSeed(!showSeed)}
                  className="text-sm text-blue-400 hover:text-blue-300 ml-4"
                >
                  {showSeed ? 'Hide' : 'Show'}
                </button>
              </div>
              <div 
                className="relative bg-gray-700 p-3 rounded border border-gray-600 text-gray-300 text-sm font-mono cursor-pointer hover:bg-gray-600 transition-all break-all"
                onClick={handleCopySeed}
              >
                {showSeed ? seed : '••••••••••••••••••'}
                {showCopiedSeed && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-xs bg-gray-800 px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </div>
              {showSeed && (
                <div className="mt-2">
                  <p className="text-center text-gray-400 text-sm mb-2">
                    Scan to import to XAMAN Wallet
                  </p>
                  <div className="flex justify-center">
                    <QRCodeSVG value={seed} size={150} className="p-2 bg-white rounded" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-gray-600">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-400">
                To create a new wallet, first save your current seed phrase, then remove this wallet and clear browser data.
              </p>
            </div>
            <button
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              onClick={handleRemoveWallet}
            >
              {showRemoveConfirm ? (
                "Are you sure? Click again to remove wallet"
              ) : (
                "Remove Wallet"
              )}
            </button>
            {showRemoveConfirm && (
              <p className="mt-2 text-xs text-red-400 text-center">
                Warning: Make sure you have saved your seed phrase! This action cannot be undone.
              </p>
            )}
          </div>
        </div>
      </PopupModal>

      <SendTokenModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        balance={balance}
        wallet={wallet}
        sourceAddress={address}
      />
    </>
  );
};

export default WalletDetailsModal; 