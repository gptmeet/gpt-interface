import React, { useState, useEffect } from 'react';
import useStore from '@store/store';

type ButtonState = 'generating' | 'none';

const StopGeneratingButton = () => {
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const error = useStore((state) => state.error);
  const lastPaymentAmount = useStore((state) => state.lastPaymentAmount);
  const [buttonState, setButtonState] = useState<ButtonState>('none');
  const [paymentState, setPaymentState] = useState<'none' | 'paying' | 'complete' | 'error'>('none');

  useEffect(() => {
    if (generating) {
      setButtonState('generating');
    } else {
      setButtonState('none');
    }
  }, [generating]);

  useEffect(() => {
    if (!generating && buttonState === 'none') {
      setPaymentState('paying');
      
      if (error?.includes('Payment failed')) {
        setPaymentState('error');
        setTimeout(() => setPaymentState('none'), 5000);
      } else {
        setTimeout(() => {
          setPaymentState('complete');
          setTimeout(() => setPaymentState('none'), 5000);
        }, 500);
      }
    }
  }, [generating, buttonState, error]);

  return (
    <>
      {buttonState === 'generating' && (
        <div className='absolute bottom-6 left-0 right-0 m-auto flex md:w-full md:m-auto gap-0 md:gap-2 justify-center'>
          <button
            className="btn relative btn-neutral border-0 md:border"
            onClick={() => setGenerating(false)}
          >
            <div className='flex w-full items-center justify-center gap-2'>
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              Stop generating
            </div>
          </button>
        </div>
      )}

      {paymentState !== 'none' && (
        <div className='absolute bottom-6 left-0 right-0 m-auto flex md:w-full md:m-auto gap-0 md:gap-2 justify-center'>
          <button className="btn relative btn-neutral border-0 md:border cursor-default">
            <div className='flex w-full items-center justify-center gap-2'>
              <div className={`w-3 h-3 ${
                paymentState === 'paying' ? 'bg-yellow-500' :
                paymentState === 'complete' ? 'bg-green-500' :
                'bg-red-500'
              } rounded-sm`} />
              <span className="text-white">
                {paymentState === 'paying' ? 'Processing payment...' :
                 paymentState === 'complete' ? `${lastPaymentAmount} Spent` :
                 'Payment Failed'}
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default StopGeneratingButton;
