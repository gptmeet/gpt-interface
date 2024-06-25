import React, { useState } from 'react';
import useStore from '@store/store';

import ChatContent from './ChatContent';
import MobileBar from '../MobileBar';
import StopGeneratingButton from '@components/StopGeneratingButton/StopGeneratingButton';

const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item mb-2">
      <div
        className="accordion-header cursor-pointer flex justify-between items-center p-2 rounded-md bg-[linear-gradient(90deg,#9945ff,#7439ffb0,#9830eca1)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-white text-sm">{title}</span>
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

const Chat = () => {
  const hideSideMenu = useStore((state) => state.hideSideMenu);

  return (
    <div className={`flex h-full flex-1 flex-col ${hideSideMenu ? 'md:pl-0' : 'md:pl-[260px]'}`}>
      <MobileBar />
      <main className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
        <Accordion title="Meeting Information">
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <MeetingBox title="Companion" />
            <MeetingBox title="Me" />
            <MeetingBox title="My Screen" />
          </div>
        </Accordion>
        <ChatContent />
        <StopGeneratingButton />
      </main>
    </div>
  );
};

export default Chat;
