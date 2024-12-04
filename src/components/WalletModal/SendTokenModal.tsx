import React, { useState } from 'react';
import PopupModal from '@components/PopupModal';
import { Client, Wallet } from 'xrpl';
import { 
  AIDA_ISSUER,
  AIDA_CURRENCY,
  XRP_LOGO_URL,
  AIDA_LOGO_URL 
} from '@lib/token-constants';

interface SendTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: { xrp: string; aida: string };
  wallet: Wallet | null;
  sourceAddress: string;
}

type TransactionStatus = 'idle' | 'sending' | 'success' | 'error';

const SendTokenModal: React.FC<SendTokenModalProps> = ({ isOpen, onClose, balance, wallet, sourceAddress }) => {
  const [selectedToken, setSelectedToken] = useState<'XRP' | 'AIDA'>('XRP');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!wallet || !sourceAddress) {
      setError('Wallet not found');
      return;
    }

    try {
      setTxStatus('sending');
      setError('');
      
      const sendAmount = Number(amount);
      const availableBalance = selectedToken === 'XRP' ? Number(balance.xrp) : Number(balance.aida);
      
      if (sendAmount > availableBalance) {
        throw new Error('Insufficient balance');
      }

      console.log('Starting transaction with source:', sourceAddress);

      const client = new Client('wss://xrplcluster.com/');
      await client.connect();

      let tx: any = {
        TransactionType: 'Payment',
        Account: sourceAddress,
        Destination: address,
        Fee: '12'
      };

      if (selectedToken === 'XRP') {
        tx.Amount = String(Math.floor(sendAmount * 1000000));
      } else {
        tx.Amount = {
          currency: AIDA_CURRENCY,
          value: String(sendAmount),
          issuer: AIDA_ISSUER
        };
      }

      if (tag) {
        tx.DestinationTag = Number(tag);
      }

      console.log('Preparing transaction:', tx);

      try {
        const prepared = await client.autofill(tx);
        console.log('Prepared transaction:', prepared);

        const signed = wallet.sign(prepared);
        console.log('Signed transaction:', signed);

        const result = await client.submitAndWait(signed.tx_blob);
        console.log('Transaction result:', result);

        const meta = result.result.meta as any;
        if (meta && meta.TransactionResult === 'tesSUCCESS') {
          setTxHash(result.result.hash);
          setTxStatus('success');
        } else {
          throw new Error(`Transaction failed: ${meta?.TransactionResult || 'Unknown error'}`);
        }
      } catch (err: any) {
        if (err.message.includes('tecNO_LINE')) {
          setError('Recipient needs to set up a trustline for AIDA token first');
        } else if (err.message.includes('tecUNFUNDED')) {
          setError('Insufficient balance to complete transaction');
        } else {
          setError(`Transaction failed: ${err.message}`);
        }
        setTxStatus('error');
      }

      await client.disconnect();
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
      setTxStatus('error');
      console.error('Transaction error:', err);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setAmount('');
    setAddress('');
    setTag('');
    setError('');
    setTxStatus('idle');
    setTxHash('');
    onClose();
  };

  // Show success state
  if (txStatus === 'success') {
    return (
      <PopupModal
        setIsModalOpen={handleClose}
        title="Transaction Sent!"
        cancelButton={false}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg text-white mb-2">Transaction Successful!</h3>
            <p className="text-gray-400 text-sm mb-4">
              {amount} {selectedToken} sent successfully
            </p>
            <a
              href={`https://xrpscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View on XRPScan
            </a>
          </div>
          <button
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </PopupModal>
    );
  }

  return (
    <PopupModal
      setIsModalOpen={handleClose}
      title="Send Tokens"
      cancelButton={false}
    >
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white text-sm">Select Token:</p>
            <div className="flex gap-3">
              <button
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  selectedToken === 'XRP' ? 'bg-purple-600' : 'bg-gray-600'
                }`}
                onClick={() => setSelectedToken('XRP')}
              >
                <img src={XRP_LOGO_URL} alt="XRP Logo" className="w-5 h-5" />
                <span className="text-white text-sm">XRP</span>
              </button>
              <button
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  selectedToken === 'AIDA' ? 'bg-purple-600' : 'bg-gray-600'
                }`}
                onClick={() => setSelectedToken('AIDA')}
              >
                <img src={AIDA_LOGO_URL} alt="AIDA Logo" className="w-4 h-4" />
                <span className="text-white text-sm">AIDA</span>
              </button>
            </div>
          </div>

          <div className="text-right text-gray-400 text-sm mb-6">
            Available: {selectedToken === 'XRP' ? balance.xrp : balance.aida} {selectedToken}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-white text-sm mb-2">Destination Address:</p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter destination address"
            />
          </div>

          <div>
            <p className="text-white text-sm mb-2">Destination Tag (optional):</p>
            <input
              type="number"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter destination tag"
            />
          </div>

          <div>
            <p className="text-white text-sm mb-2">Amount:</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder={`Enter amount in ${selectedToken}`}
            />
          </div>
        </div>

        <div className="flex justify-between gap-6 mt-8">
          <button
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm"
            onClick={handleClose}
            disabled={txStatus === 'sending'}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors relative text-sm"
            onClick={handleSend}
            disabled={!amount || !address || txStatus === 'sending'}
          >
            {txStatus === 'sending' ? (
              <>
                <span className="opacity-0">Send</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900 bg-opacity-50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </PopupModal>
  );
};

export default SendTokenModal; 