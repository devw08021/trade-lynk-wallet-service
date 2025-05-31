export interface BlockchainAdapter {
  createWallet(): Promise<{ address: string; privateKey: string }>;
  getBalance(address: string): Promise<number>;
  sendTransaction(from: string, to: string, amount: number, privateKey: string): Promise<string>;
  getTransaction(txHash: string): Promise<{
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    blockNumber?: number;
    amount: number;
    from: string;
    to: string;
  }>;
  validateAddress(address: string): boolean;
}

export class BitcoinAdapter implements BlockchainAdapter {
  // Implementation for Bitcoin
  async createWallet(): Promise<{ address: string; privateKey: string }> {
    // Implementation using bitcoinjs-lib
    throw new Error('Not implemented');
  }

  async getBalance(address: string): Promise<number> {
    // Implementation using Bitcoin node
    throw new Error('Not implemented');
  }

  async sendTransaction(from: string, to: string, amount: number, privateKey: string): Promise<string> {
    // Implementation using Bitcoin node
    throw new Error('Not implemented');
  }

  async getTransaction(txHash: string) {
    // Implementation using Bitcoin node
    throw new Error('Not implemented');
  }

  validateAddress(address: string): boolean {
    // Implementation using bitcoinjs-lib
    throw new Error('Not implemented');
  }
}

export class EthereumAdapter implements BlockchainAdapter {
  // Implementation for Ethereum
  async createWallet(): Promise<{ address: string; privateKey: string }> {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }

  async getBalance(address: string): Promise<number> {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }

  async sendTransaction(from: string, to: string, amount: number, privateKey: string): Promise<string> {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }

  async getTransaction(txHash: string) {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }

  validateAddress(address: string): boolean {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }
}

export class TronAdapter implements BlockchainAdapter {
  // Implementation for Tron
  async createWallet(): Promise<{ address: string; privateKey: string }> {
    // Implementation using tronweb
    throw new Error('Not implemented');
  }

  async getBalance(address: string): Promise<number> {
    // Implementation using tronweb
    throw new Error('Not implemented');
  }

  async sendTransaction(from: string, to: string, amount: number, privateKey: string): Promise<string> {
    // Implementation using tronweb
    throw new Error('Not implemented');
  }

  async getTransaction(txHash: string) {
    // Implementation using tronweb
    throw new Error('Not implemented');
  }

  validateAddress(address: string): boolean {
    // Implementation using tronweb
    throw new Error('Not implemented');
  }
}

export class BnbAdapter implements BlockchainAdapter {
  // Implementation for BNB
  async createWallet(): Promise<{ address: string; privateKey: string }> {
    // Implementation using web3.js (BNB is EVM compatible)
    throw new Error('Not implemented');
  }

  async getBalance(address: string): Promise<number> {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }

  async sendTransaction(from: string, to: string, amount: number, privateKey: string): Promise<string> {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }

  async getTransaction(txHash: string) {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }

  validateAddress(address: string): boolean {
    // Implementation using web3.js
    throw new Error('Not implemented');
  }
} 