import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';

import NewChat from './NewChat';
import NewFolder from './NewFolder';
import ChatHistoryList from './ChatHistoryList';
import MenuOptions from './MenuOptions';

import CrossIcon2 from '@icon/CrossIcon2';
import DownArrow from '@icon/DownArrow';
import MenuIcon from '@icon/MenuIcon';
import SettingIcon from '@icon/SettingIcon';
import PersonIcon from '@icon/PersonIcon';

const logoUrl = 'https://gptmeet.vercel.app/images/h-logo-2-p-500.png';
const solLogoUrl = 'https://cryptologos.cc/logos/solana-sol-logo.png';
const meetLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Google_Meet_icon_%282020%29.svg/2491px-Google_Meet_icon_%282020%29.svg.png';

const Menu = () => {
  const hideSideMenu = useStore((state) => state.hideSideMenu);
  const setHideSideMenu = useStore((state) => state.setHideSideMenu);

  const windowWidthRef = useRef<number>(window.innerWidth);
  const [walletAddress, setWalletAddress] = useState('Qric...D5KD');
  const [solBalance, setSolBalance] = useState('0.00');
  const [solUsdValue, setSolUsdValue] = useState('0.00');
  const [meetBalance, setMeetBalance] = useState('0.00');
  const [meetUsdValue, setMeetUsdValue] = useState('0.00');
  const [maxApproval, setMaxApproval] = useState('1000');
  const [inputApproval, setInputApproval] = useState('');

  useEffect(() => {
    if (window.innerWidth < 768) setHideSideMenu(true);
    window.addEventListener('resize', () => {
      if (
        windowWidthRef.current !== window.innerWidth &&
        window.innerWidth < 768
      )
        setHideSideMenu(true);
    });
  }, []);

  const handleConnectWallet = () => {
    alert('Connect Wallet button clicked');
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    alert('Wallet address copied to clipboard');
  };

  const handleSetApproval = () => {
    setMaxApproval(inputApproval);
    alert(`Max approval set to: ${inputApproval}`);
  };

  return (
    <>
      <div
        id='menu'
        className={`group/menu dark bg-gray-900 fixed md:inset-y-0 md:flex md:w-[260px] md:flex-col transition-transform z-[999] top-0 left-0 h-full max-md:w-3/4 ${hideSideMenu ? 'translate-x-[-100%]' : 'translate-x-[0%]'
          }`}
      >
        <div className='flex h-full min-h-0 flex-col'>
          <div className='flex h-full w-full flex-1 items-start border-white/20'>
            <nav className='flex h-full flex-1 flex-col space-y-1 px-2 pt-2'>
              <img src={logoUrl} alt="GPT Meet Logo" className='pb-1' style={{ width: '150px', height: 'auto' }} />
              <div className='flex gap-2 items-center'>
                <NewChat />
                <NewFolder />
              </div>
              <ChatHistoryList />
              <button
                className='btn-primary'
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </button>
              <div className="mt-4 bg-gray-800 p-2 rounded-md flex items-center gap-2">
                <div className="bg-purple-600 p-1 rounded-full text-white flex items-center justify-center bg-purple-600">
                  <PersonIcon />
                </div>

                <div className="flex-1">
                  <div className="text-white text-sm">Me</div>
                  <div className="text-gray-400 text-xs cursor-pointer" onClick={handleCopyAddress}>
                    {walletAddress}
                  </div>
                </div>
                <SettingIcon className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
              <div className="mt-4 bg-gray-800 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <img src={solLogoUrl} alt="SOL Logo" className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="text-white text-sm">{solBalance} $SOL</div>
                    <div className="text-gray-400 text-xs">${solUsdValue}</div>
                  </div>
                  <a href="https://jup.ag" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <img src={meetLogoUrl} alt="MEET Logo" className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="text-white text-sm">{meetBalance} $MEET</div>
                    <div className="text-gray-400 text-xs">${meetUsdValue}</div>
                  </div>
                  <a href="https://jup.ag" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="mt-4 bg-gray-800 p-2 rounded-md">
                <div className="text-white mb-2">Max Approved: <span className="text-purple-500 font-bold">{maxApproval}</span></div>
                <div className="flex flex-col gap-2">
                  <input
                    type="number"
                    className="text-gray-800 dark:text-white p-2 text-sm bg-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-opacity m-0 w-full h-full focus:outline-none rounded border border-white/20"
                    value={inputApproval}
                    onChange={(e) => setInputApproval(e.target.value)}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleSetApproval}
                  >
                    Set Approval
                  </button>
                </div>
              </div>
              <MenuOptions />
            </nav>
          </div>
        </div>
        <div
          id='menu-close'
          className={`${hideSideMenu ? 'hidden' : ''
            } md:hidden absolute z-[999] right-0 translate-x-full top-10 bg-gray-900 p-2 cursor-pointer hover:bg-black text-white`}
          onClick={() => {
            setHideSideMenu(true);
          }}
        >
          <CrossIcon2 />
        </div>
        <div
          className={`${hideSideMenu ? 'opacity-100' : 'opacity-0'
            } group/menu md:group-hover/menu:opacity-100 max-md:hidden transition-opacity absolute z-[999] right-0 translate-x-full top-10 bg-gray-900 p-2 cursor-pointer hover:bg-black text-white ${hideSideMenu ? '' : 'rotate-90'
            }`}
          onClick={() => {
            setHideSideMenu(!hideSideMenu);
          }}
        >
          {hideSideMenu ? (
            <MenuIcon className='h-4 w-4' />
          ) : (
            <DownArrow className='h-4 w-4' />
          )}
        </div>
      </div>
      <div
        id='menu-backdrop'
        className={`${hideSideMenu ? 'hidden' : ''
          } md:hidden fixed top-0 left-0 h-full w-full z-[60] bg-gray-900/70`}
        onClick={() => {
          setHideSideMenu(true);
        }}
      />
    </>
  );
};

export default Menu;
