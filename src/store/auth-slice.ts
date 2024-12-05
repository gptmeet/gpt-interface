import { defaultAPIEndpoint } from '@constants/auth';
import { StoreSlice } from './store';
import { Wallet } from 'xrpl';

export interface AuthSlice {
  apiKey?: string;
  apiEndpoint: string;
  firstVisit: boolean;
  paymentToken: 'XRP' | 'AIDA';
  xrpBalance: string;
  aidaBalance: string;
  wallet: Wallet | null;
  lastPaymentAmount: string;
  setApiKey: (apiKey: string) => void;
  setApiEndpoint: (apiEndpoint: string) => void;
  setFirstVisit: (firstVisit: boolean) => void;
  setXrpBalance: (balance: string) => void;
  setAidaBalance: (balance: string) => void;
  setWallet: (wallet: Wallet | null) => void;
  setLastPaymentAmount: (amount: string) => void;
  setPaymentToken: (token: 'XRP' | 'AIDA') => void;
}

export const createAuthSlice: StoreSlice<AuthSlice> = (set, get) => ({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || undefined,
  apiEndpoint: defaultAPIEndpoint,
  firstVisit: true,
  paymentToken: 'XRP',
  xrpBalance: '0',
  aidaBalance: '0',
  wallet: null,
  lastPaymentAmount: '',
  setApiKey: (apiKey: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiKey: apiKey,
    }));
  },
  setApiEndpoint: (apiEndpoint: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiEndpoint: apiEndpoint,
    }));
  },
  setFirstVisit: (firstVisit: boolean) => {
    set((prev: AuthSlice) => ({
      ...prev,
      firstVisit: firstVisit,
    }));
  },
  setXrpBalance: (balance: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      xrpBalance: balance,
    }));
  },
  setAidaBalance: (balance: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      aidaBalance: balance,
    }));
  },
  setWallet: (wallet: Wallet | null) => {
    set((prev: AuthSlice) => ({
      ...prev,
      wallet: wallet,
    }));
  },
  setLastPaymentAmount: (amount: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      lastPaymentAmount: amount,
    }));
  },
  setPaymentToken: (token: 'XRP' | 'AIDA') => {
    set((prev: AuthSlice) => ({
      ...prev,
      paymentToken: token,
    }));
  },
});
