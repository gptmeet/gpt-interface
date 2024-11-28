import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import PersonIcon from '@icon/PersonIcon';
import ApiMenu from '@components/ApiMenu';

const Config = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    const storedKey = localStorage.getItem('apiKey');
    return storedKey || import.meta.env.VITE_OPENAI_API_KEY || '';
  });

  const resetToDefault = () => {
    const defaultKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    setApiKey(defaultKey);
    localStorage.removeItem('apiKey');
  };

  return (
    <>
      <button
        className='btn btn-neutral'
        id='api-menu'
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-3">
          <PersonIcon />
          <span>{t('api')}</span>
        </div>
      </button>

      {isModalOpen && <ApiMenu setIsModalOpen={setIsModalOpen} />}
    </>
  );
};

export default Config;
