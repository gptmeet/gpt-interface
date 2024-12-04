import React, { useState } from 'react';
import { Wallet } from 'xrpl';
import PopupModal from '@components/PopupModal';
import { QRCodeSVG } from 'qrcode.react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletCreated: (address: string, seed: string) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onWalletCreated }) => {
  const [importSeed, setImportSeed] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newWallet, setNewWallet] = useState<{ address: string; seed: string } | null>(null);
  const [showCopiedAddress, setShowCopiedAddress] = useState(false);
  const [showCopiedSeed, setShowCopiedSeed] = useState(false);

  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      setError('');
      const wallet = Wallet.generate();
      if (wallet.classicAddress && wallet.seed) {
        setNewWallet({ address: wallet.classicAddress, seed: wallet.seed });
        setShowConfirmation(true);
      } else {
        throw new Error('Failed to generate wallet');
      }
    } catch (err) {
      setError('Failed to create wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCreate = () => {
    if (newWallet) {
      onWalletCreated(newWallet.address, newWallet.seed);
      setNewWallet(null);
      setShowConfirmation(false);
    }
  };

  const handleImportWallet = async () => {
    try {
      setLoading(true);
      setError('');
      
      const wallet = Wallet.fromSeed(importSeed);
      if (wallet.classicAddress && wallet.seed) {
        onWalletCreated(wallet.classicAddress, wallet.seed);
      } else {
        throw new Error('Invalid family seed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid family seed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(newWallet?.address || '');
    setShowCopiedAddress(true);
    setTimeout(() => setShowCopiedAddress(false), 2000);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(newWallet?.seed || '');
    setShowCopiedSeed(true);
    setTimeout(() => setShowCopiedSeed(false), 2000);
  };

  if (!isOpen) return null;

  if (showConfirmation && newWallet) {
    return (
      <PopupModal
        setIsModalOpen={() => {
          setShowConfirmation(false);
          setNewWallet(null);
          onClose();
        }}
        title="⚠️ Save Your Wallet Seed"
        cancelButton={false}
      >
        <div className="p-6 border-b border-gray-600 bg-gray-800">
          <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-md mb-4">
            <p className="text-yellow-400 font-bold mb-2">IMPORTANT:</p>
            <ul className="text-yellow-400 text-sm list-disc list-inside space-y-1">
              <li>Save your seed phrase in a secure location</li>
              <li>Never share it with anyone</li>
              <li>You cannot recover your funds without it</li>
              <li>This is the only time you'll see it</li>
              <li>You can scan the QR codes with XUMM wallet to import</li>
            </ul>
          </div>

          <div className="mb-4">
            <p className="text-white text-sm mb-2">Your Wallet Address:</p>
            <div 
              className="relative bg-gray-700 p-3 rounded border border-gray-600 text-gray-300 text-sm font-mono cursor-pointer hover:bg-gray-600 transition-all"
              onClick={handleCopyAddress}
            >
              {newWallet.address}
              {showCopiedAddress && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-xs">
                  Copied!
                </span>
              )}
            </div>
            <div className="mt-2 flex justify-center">
              <QRCodeSVG value={newWallet.address} size={150} className="p-2 bg-white rounded" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white text-sm mb-2">Your Secret Seed:</p>
            <div 
              className="relative bg-gray-700 p-3 rounded border border-gray-600 text-gray-300 text-sm font-mono cursor-pointer hover:bg-gray-600 transition-all"
              onClick={handleCopySeed}
            >
              {newWallet.seed}
              {showCopiedSeed && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-xs">
                  Copied!
                </span>
              )}
            </div>
            <div className="mt-2 flex justify-center">
              <QRCodeSVG value={newWallet.seed} size={150} className="p-2 bg-white rounded" />
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              onClick={() => {
                setShowConfirmation(false);
                setNewWallet(null);
              }}
            >
              Cancel
            </button>
            <button
              className="flex-1 btn-primary"
              onClick={handleConfirmCreate}
            >
              I've Saved My Seed
            </button>
          </div>
        </div>
      </PopupModal>
    );
  }

  return (
    <PopupModal
      setIsModalOpen={onClose}
      title="Create or Import Wallet"
      cancelButton={false}
    >
      <div className="p-6 border-b border-gray-600 bg-gray-800">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-6">
          <button 
            className="btn-primary w-full mb-2"
            onClick={handleCreateWallet}
            disabled={loading}
          >
            Create New Wallet
          </button>
        </div>
        <div className="mb-4">
          <p className="text-white mb-2">Or import existing wallet:</p>
          <input
            type="text"
            value={importSeed}
            onChange={(e) => setImportSeed(e.target.value)}
            placeholder="Enter family seed"
            className="w-full p-3 rounded bg-gray-700 text-white mb-2 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />
          <button 
            className="btn-primary w-full"
            onClick={handleImportWallet}
            disabled={loading || !importSeed}
          >
            Import Wallet
          </button>
        </div>
      </div>
    </PopupModal>
  );
};

export default WalletModal; 