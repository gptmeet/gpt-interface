import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';

interface PopupModalProps {
  title: string;
  setIsModalOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  cancelButton?: boolean;
}

const PopupModal: React.FC<PopupModalProps> = ({
  title,
  setIsModalOpen,
  children,
  cancelButton = true,
}) => {
  const modalRoot = document.getElementById('modal-root');
  const { t } = useTranslation();

  const handleClose = () => {
    setIsModalOpen(false);
  };

  if (modalRoot) {
    return ReactDOM.createPortal(
      <div className='fixed top-0 left-0 z-[999] w-full h-full flex justify-center items-center bg-gray-900/75'>
        <div className='relative z-2 w-[1000px] flex justify-center'>
          <div className='w-full bg-gray-800 rounded-lg shadow dark'>
            <div className='flex items-center justify-between p-4 border-b border-gray-600 bg-gray-800 rounded-t'>
              <h3 className='ml-2 text-lg font-semibold text-white'>
                {title}
              </h3>
              <button
                type='button'
                className='text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg p-1.5'
                onClick={handleClose}
              >
                ×
              </button>
            </div>

            <div className='!bg-gray-800 w-full [&>*]:!bg-gray-800'>
              {children}
            </div>

            {cancelButton && (
              <div className='flex items-center justify-end p-4 !bg-gray-800 rounded-b border-t border-gray-600'>
                <button
                  type='button'
                  className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded'
                  onClick={handleClose}
                >
                  {t('cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>,
      modalRoot
    );
  }
  return null;
};

export default PopupModal; 