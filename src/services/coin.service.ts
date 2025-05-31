// src/services/coin.service.ts

export const coinService = {
  async createEvmAddress(userId: string, evmServer: string): Promise<string> {
    // TODO: Implement API/Kafka call to EVM coin server to create address
    // Example: return await callEvmServer(userId, evmServer);
    return `evm_${userId}_${evmServer}`;
  },

  async createNonEvmAddress(userId: string, symbol: string): Promise<string> {
    // TODO: Implement API/Kafka call to non-EVM coin server to create address
    // Example: return await callNonEvmServer(userId, symbol);
    return `non_evm_${userId}_${symbol}`;
  },

  async withdraw(userId: string, symbol: string, amount: number, address: string): Promise<string> {
    // TODO: Implement API/Kafka call to coin server to process withdrawal
    // Example: return await callWithdraw(userId, symbol, amount, address);
    return `withdraw_tx_hash_${userId}_${symbol}`;
  },
}; 