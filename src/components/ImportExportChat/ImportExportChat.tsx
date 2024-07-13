import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ExportIcon from '@icon/ExportIcon';
import PopupModal from '@components/PopupModal';

import ImportChat from './ImportChat';
import ExportChat from './ExportChat';
import ImportChatOpenAI from './ImportChatOpenAI';

const ImportExportChat = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <button
        className='btn btn-neutral'
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <div className="flex items-center gap-3">
          <ExportIcon className='w-4 h-4' />
          <span>{t('import')} / {t('export')}</span>
        </div>
      </button>

      {isModalOpen && (
        <PopupModal
          title={`${t('import')} / ${t('export')}`}
          setIsModalOpen={setIsModalOpen}
          cancelButton={false}
        >
          <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
            <ImportChat />
            <ExportChat />
            <div className='border-t my-3 border-gray-200 dark:border-gray-600' />
            <ImportChatOpenAI setIsModalOpen={setIsModalOpen} />
          </div>
        </PopupModal>
      )}
    </>
  );
};

export default ImportExportChat;
