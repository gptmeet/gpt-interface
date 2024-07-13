import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import PersonIcon from '@icon/PersonIcon';
import ApiMenu from '@components/ApiMenu';

const Config = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
