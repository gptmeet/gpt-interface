import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';
import useStore from '@store/store';
import ConfigMenu from '@components/ConfigMenu';
import { ChatInterface, ConfigInterface } from '@type/chat';
import { _defaultChatConfig } from '@constants/chat';

const Accordion = ({ title, children, summary }: { title: string; children: React.ReactNode; summary: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item mb-2">
      <div
        className="accordion-header cursor-pointer flex justify-between items-center p-2 rounded-md bg-[linear-gradient(90deg,#9945ff,#7439ffb0,#9830eca1)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-4">
          <span className="text-white text-sm">{title}</span>
          {summary}
        </div>
        <span className="text-white">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && <div className="accordion-content p-2 bg-[linear-gradient(90deg,#9945ff,#7439ffb0,#9830eca1)] rounded-md">{children}</div>}
    </div>
  );
};

const MeetingBox = ({ title }: { title: string }) => {
  const imageUrl = 'https://img.freepik.com/free-vector/colorful-equalizer-wave-wallpaper_23-2148410358.jpg';

  return (
    <div className="relative w-40 h-24 bg-purple-600 rounded-md flex items-center justify-center overflow-hidden">
      <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover rounded-md" />
      <div className="absolute top-2 left-2">
        <button className="p-1 bg-gray-800 bg-opacity-50 rounded-full text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l2-2m0 0l-2-2m2 2H7m6 2v6a2 2 0 002 2h4a2 2 0 002-2v-6a2 2 0 00-2-2h-4zm-7 6H5a2 2 0 01-2-2v-6a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-2 right-2">
        <button className="p-1 bg-gray-800 bg-opacity-50 rounded-full text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7V5m0 14V5" />
          </svg>
        </button>
      </div>
      <div className="relative text-white z-10">{title}</div>
    </div>
  );
};

const ChatTitle = React.memo(() => {
  const { t } = useTranslation('model');
  const config = useStore(
    (state) =>
      state.chats &&
      state.chats.length > 0 &&
      state.currentChatIndex >= 0 &&
      state.currentChatIndex < state.chats.length
        ? state.chats[state.currentChatIndex].config
        : undefined,
    shallow
  );
  const setChats = useStore((state) => state.setChats);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const setConfig = (config: ConfigInterface) => {
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    updatedChats[currentChatIndex].config = config;
    setChats(updatedChats);
  };

  // for migrating from old ChatInterface to new ChatInterface (with config)
  useEffect(() => {
    const chats = useStore.getState().chats;
    if (chats && chats.length > 0 && currentChatIndex !== -1 && !config) {
      const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
      updatedChats[currentChatIndex].config = { ..._defaultChatConfig };
      setChats(updatedChats);
    }
  }, [currentChatIndex]);

  const maxApproval = 1000; // Replace with actual state if needed
  const used = 200; // Example value for used tokens
  const left = maxApproval - used; // Example calculation for tokens left

  return config ? (
    <>
      <Accordion
        title="Meeting Information"
        summary={
          <div className="flex items-center space-x-4">
            <div className="text-white text-xxs">Approved: <span className="text-purple-300 font-bold">{maxApproval}</span></div>
            <div className="text-white text-xxs">Used: <span className="text-purple-300 font-bold">{used}</span></div>
            <div className="text-white text-xxs">Left: <span className="text-purple-300 font-bold">{left}</span></div>
          </div>
        }
      >
        <div
          className='flex gap-x-4 gap-y-1 flex-wrap w-full items-center justify-center border-b cursor-pointer'
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 text-white text-xxs'>
            {t('model')}: {config.model}
          </div>
          <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 text-white text-xxs'>
            {t('token.label')}: {config.max_tokens}
          </div>
          <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 text-white text-xxs'>
            {t('temperature.label')}: {config.temperature}
          </div>
          <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 text-white text-xxs'>
            {t('topP.label')}: {config.top_p}
          </div>
          <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 text-white text-xxs'>
            {t('presencePenalty.label')}: {config.presence_penalty}
          </div>
          <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 text-white text-xxs'>
            {t('frequencyPenalty.label')}: {config.frequency_penalty}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <MeetingBox title="Companion" />
          <MeetingBox title="Me" />
          <MeetingBox title="My Screen" />
        </div>
      </Accordion>
      {isModalOpen && (
        <ConfigMenu
          setIsModalOpen={setIsModalOpen}
          config={config}
          setConfig={setConfig}
        />
      )}
    </>
  ) : (
    <></>
  );
});

export default ChatTitle;
