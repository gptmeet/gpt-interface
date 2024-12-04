import { Client, AccountLinesResponse } from 'xrpl';
import { 
  AIDA_ISSUER, 
  AIDA_CURRENCY,
  DEFAULT_TRUSTLINE_LIMIT,
  MIN_XRP_FOR_TRUSTLINE 
} from './token-constants';

interface TrustLine {
  account: string;
  balance: string;
  currency: string;
  limit: string;
  limit_peer: string;
  quality_in: number;
  quality_out: number;
}

const client = new Client('wss://xrplcluster.com/');

export const getBalances = async (address: string) => {
  try {
    console.log('Fetching balances for address:', address);
    await client.connect();
    
    // Get XRP balance
    const accountInfo = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    
    console.log('Account info response:', accountInfo);
    const xrpBalance = accountInfo.result.account_data.Balance;
    console.log('XRP Balance (raw):', xrpBalance);
    
    // Get AIDA balance
    const lines = await client.request({
      command: 'account_lines',
      account: address,
      peer: AIDA_ISSUER,
      ledger_index: 'validated'
    }) as AccountLinesResponse;
    
    console.log('Trust lines response:', lines);
    
    // Find AIDA trustline
    const aidaLine = lines.result.lines.find((line: TrustLine) => {
      console.log('Checking line:', {
        currency: line.currency,
        account: line.account,
        balance: line.balance,
        isMatch: line.currency === AIDA_CURRENCY && line.account === AIDA_ISSUER
      });
      return line.currency === AIDA_CURRENCY && line.account === AIDA_ISSUER;
    });
    
    console.log('Found AIDA line:', aidaLine);

    return {
      xrp: Number(xrpBalance) / 1_000_000,  // Convert drops to XRP
      aida: aidaLine ? Number(aidaLine.balance) : 0
    };
  } catch (error) {
    console.error('Detailed error in getBalances:', error);
    if (error instanceof Error && error.message?.includes('Account not found')) {
      return { xrp: 0, aida: 0 };
    }
    throw error;
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}; 

// Add function to set up trustline
export const setupAidaTrustline = async (wallet: any) => {
  try {
    console.log('Setting up AIDA trustline for wallet:', wallet.classicAddress);
    const client = new Client('wss://xrplcluster.com/');
    await client.connect();

    // Check XRP balance first
    const accountInfo = await client.request({
      command: 'account_info',
      account: wallet.classicAddress,
      ledger_index: 'validated'
    }).catch(() => null);

    if (!accountInfo) {
      throw new Error('Account not activated. Please send some XRP to activate the account first.');
    }

    const xrpBalance = Number(accountInfo.result.account_data.Balance) / 1_000_000;
    if (xrpBalance < MIN_XRP_FOR_TRUSTLINE) { // Need at least 10 XRP reserve + fees
      throw new Error('Insufficient XRP balance. Account needs at least 11 XRP to set up trustline.');
    }

    // Check existing trustlines
    const lines = await client.request({
      command: 'account_lines',
      account: wallet.classicAddress,
      peer: AIDA_ISSUER,
      ledger_index: 'validated'
    });

    console.log('Existing trust lines:', lines);

    // Check if AIDA trustline already exists
    const hasAidaTrustline = lines.result.lines.some(
      (line: any) => line.currency === AIDA_CURRENCY && line.account === AIDA_ISSUER
    );

    if (hasAidaTrustline) {
      console.log('AIDA trustline already exists');
      await client.disconnect();
      return;
    }

    // Set up new trustline
    const trustSetTx = {
      TransactionType: 'TrustSet' as const,
      Account: wallet.classicAddress,
      Fee: '12',
      Flags: 0x00000000,
      LimitAmount: {
        currency: AIDA_CURRENCY,
        issuer: AIDA_ISSUER,
        value: DEFAULT_TRUSTLINE_LIMIT
      }
    };

    const prepared = await client.autofill(trustSetTx);
    console.log('Prepared transaction:', prepared);

    const signed = wallet.sign(prepared);
    console.log('Signed transaction:', signed);

    const result = await client.submitAndWait(signed.tx_blob);
    console.log('Transaction result:', result);

    // Fix type checking for transaction result
    const meta = result.result.meta as any;  // Type assertion for now
    if (meta && meta.TransactionResult === 'tesSUCCESS') {
      return result;
    } else {
      throw new Error(`Failed to set trustline: ${meta?.TransactionResult || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Detailed error setting up AIDA trustline:', error);
    if (error instanceof Error) {
      if (error.message.includes('Account not activated')) {
        throw new Error('Please send some XRP to activate your account before setting up AIDA.');
      }
      if (error.message.includes('Insufficient XRP')) {
        throw new Error('Please ensure you have at least 11 XRP in your account.');
      }
    }
    throw error;
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}; 