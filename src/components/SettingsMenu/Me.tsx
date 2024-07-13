import React from 'react';
import { useTranslation } from 'react-i18next';

import HeartIcon from '@icon/HeartIcon';

const Me = () => {
  const { t } = useTranslation();
  return (
    <a
      className='btn btn-neutral'
      href='https://github.com/ztjhz/BetterChatGPT'
      target='_blank'
    >
      <div className="flex items-center gap-3">
        <HeartIcon />
        <span>{t('author')}</span>
      </div>
    </a>

  );
};

export default Me;
