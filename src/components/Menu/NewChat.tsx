import React from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';

import PlusIcon from '@icon/PlusIcon';

import useAddChat from '@hooks/useAddChat';

const NewChat = ({ folder }: { folder?: string }) => {
  const { t } = useTranslation();
  const addChat = useAddChat();
  const generating = useStore((state) => state.generating);

  return (
    <a
      className={`btn-primary flex flex-1 items-center rounded-md transition-all duration-200 text-white text-sm ${
        generating ? 'cursor-not-allowed opacity-40' : 'cursor-pointer opacity-100'
      } ${folder ? 'justify-start' : 'py-2 px-2 gap-3 mb-2'}`}
      onClick={() => {
        if (!generating) addChat(folder);
      }}
      title={folder ? String(t('newChat')) : ''}
    >
      {folder ? (
        <div className='max-h-0 parent-sibling-hover:max-h-10 hover:max-h-10 parent-sibling-hover:py-2 hover:py-2 px-2 overflow-hidden transition-all duration-200 delay-500 text-sm flex gap-3 items-center text-gray-100'>
          <PlusIcon /> {t('newChat')}
        </div>
      ) : (
        <>
          <PlusIcon />
          <span className='inline-flex text-white text-sm'>{t('newChat')}</span>
        </>
      )}
    </a>
  );
};

export default NewChat;
