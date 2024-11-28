import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ApiMenu = ({ setIsModalOpen }: Props) => {
  const { t } = useTranslation('api');
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Load API key on component mount
    const storedKey = localStorage.getItem('apiKey');
    setApiKey(storedKey || import.meta.env.VITE_OPENAI_API_KEY || '');
  }, []);

  const handleSave = () => {
    if (apiKey.trim() === '') {
      // If empty, remove from localStorage to use default
      localStorage.removeItem('apiKey');
    } else {
      localStorage.setItem('apiKey', apiKey.trim());
    }
    setIsModalOpen(false);
  };

  const handleReset = () => {
    const defaultKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    setApiKey(defaultKey);
    localStorage.removeItem('apiKey');
  };

  return (
    <div className="modal-content">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold">
            {t('apiKey.inputLabel')}
          </label>
          <input
            type="password"
            className="input-primary"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>
        
        <button 
          className="btn btn-neutral"
          onClick={handleReset}
        >
          {t('resetToDefault')}
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ApiMenu; 