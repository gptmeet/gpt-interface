import React, { useState, useEffect } from 'react';
import useStore from '@store/store';

type ButtonState = 'generating' | 'paying' | 'complete' | 'error' | 'none';

const StopGeneratingButton = () => {
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const error = useStore((state) => state.error);
  const [buttonState, setButtonState] = useState<ButtonState>('none');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const lastPaymentAmount = useStore((state) => state.lastPaymentAmount);

  useEffect(() => {
    if (generating) {
      setButtonState('generating');
    } else if (buttonState === 'generating') {
      setButtonState('paying');
      
      setTimeout(() => {
        if (error?.includes('Payment failed')) {
          setButtonState('error');
          setTimeout(() => {
            setButtonState('none');
          }, 2000);
        }
      }, 100);
    }
  }, [generating, error]);

  // Listen for successful payment
  useEffect(() => {
    if (buttonState === 'paying' && !generating && !error) {
      setTimeout(() => {
        setButtonState('complete');
        setPaymentAmount(lastPaymentAmount);
        setTimeout(() => {
          setButtonState('none');
        }, 2000);
      }, 500);
    }
  }, [buttonState, generating, error, lastPaymentAmount]);

  const getButtonStyle = () => {
    switch (buttonState) {
      case 'generating':
        return 'bg-red-500';
      case 'paying':
        return 'bg-yellow-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  const getButtonText = () => {
    switch (buttonState) {
      case 'generating':
        return 'Stop generating';
      case 'paying':
        return 'Paying...';
      case 'complete':
        return `${paymentAmount} Spent`;
      case 'error':
        return 'Payment Failed';
      default:
        return '';
    }
  };

  if (buttonState === 'none') return null;

  return (
    <div className='absolute bottom-6 left-0 right-0 m-auto flex md:w-full md:m-auto gap-0 md:gap-2 justify-center'>
      <button
        className={`btn relative btn-neutral border-0 md:border ${
          buttonState === 'paying' || buttonState === 'error' ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => buttonState === 'generating' && setGenerating(false)}
        disabled={buttonState !== 'generating'}
      >
        <div className='flex w-full items-center justify-center gap-2'>
          <div className={`w-3 h-3 ${getButtonStyle()} rounded-sm`} />
          {getButtonText()}
        </div>
      </button>
    </div>
  );
};

export default StopGeneratingButton;
