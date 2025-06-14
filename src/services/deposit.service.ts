import { getRepository } from "@/models/repositoryFactory";
import { CurrencyModel, PendingDepositModel } from "@/models/schemas/index";
import { WalletService } from "./wallet.service";

interface DepositData {
  userCode: number;
  currencyId: string;
  symbol: string;
  chainId: string;
  tokenType: string;
  address: string;
  txHash: string;
  amount: number;
}

export class DepositService {
  private currencyRep = getRepository(CurrencyModel);
  private pendingDepositRep = getRepository(PendingDepositModel);
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  private async validateDepositData(data: DepositData): Promise<boolean> {
    try {
      const currency = await this.currencyRep.findById(data.currencyId,{isActive:true});
      if (!currency || !currency.isActive) {
        console.error(`Invalid or inactive currency: ${data.symbol}`);
        return false;
      }

      const existingTx = await this.pendingDepositRep.findOne({ txHash: data.txHash });
      if (existingTx) {
        console.error(`Duplicate transaction hash: ${data.txHash}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating deposit data:', error);
      return false;
    }
  }

  private async handlePendingDeposit(data: DepositData): Promise<void> {
    try {
      const existingPending = await this.pendingDepositRep.findOne({
        userCode: data.userCode,
        currencyId: data.currencyId,
        status: 'pending'
      });

      if (existingPending) {
        const newTotalAmount = existingPending.totalAmount + data.amount;
        await this.pendingDepositRep.findByIdAndUpdate(existingPending._id, {
          $inc: { totalAmount: data.amount },
          $push: { 
            deposits: {
              txHash: data.txHash,
              amount: data.amount,
              timestamp: new Date()
            }
          }
        });
      } else {
        await this.pendingDepositRep.create({
          ...data,
          totalAmount: data.amount,
          deposits: [{
            txHash: data.txHash,
            amount: data.amount,
            timestamp: new Date()
          }]
        });
      }
    } catch (error) {
      console.error('Error handling pending deposit:', error);
      throw error;
    }
  }

  private async processCompletedDeposit(data: DepositData): Promise<void> {
    try {
      await this.walletService.creditAmount(
        data.userCode.toString(),
        'spot',
        data.currencyId,
        data.amount
      );

      await this.pendingDepositRep.deleteMany({
        userCode: data.userCode,
        currencyId: data.currencyId,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error processing completed deposit:', error);
      throw error;
    }
  }

  async handleEthDeposit(data: DepositData): Promise<void> {
    if (!await this.validateDepositData(data)) return;

    const currency = await this.currencyRep.findById(data.currencyId);
    if (!currency) return;

    const minDeposit = currency.network?.minDeposit || 0;
    
    if (data.amount >= minDeposit) {
      await this.processCompletedDeposit(data);
    } else {
      await this.handlePendingDeposit(data);
    }
  }

  async handleErc20Deposit(data: DepositData): Promise<void> {
    if (!await this.validateDepositData(data)) return;

    const currency = await this.currencyRep.findById(data.currencyId);
    if (!currency) return;

    const minDeposit = currency.network?.minDeposit || 0;
    
    if (data.amount >= minDeposit) {
      await this.processCompletedDeposit(data);
    } else {
      await this.handlePendingDeposit(data);
    }
  }

  async handleBnbDeposit(data: DepositData): Promise<void> {
    if (!await this.validateDepositData(data)) return;

    const currency = await this.currencyRep.findById(data.currencyId);
    if (!currency) return;

    const minDeposit = currency.network?.minDeposit || 0;
    
    if (data.amount >= minDeposit) {
      await this.processCompletedDeposit(data);
    } else {
      await this.handlePendingDeposit(data);
    }
  }

  async handleBep20Deposit(data: DepositData): Promise<void> {
    if (!await this.validateDepositData(data)) return;

    const currency = await this.currencyRep.findById(data.currencyId);
    if (!currency) return;

    const minDeposit = currency.network?.minDeposit || 0;
    
    if (data.amount >= minDeposit) {
      await this.processCompletedDeposit(data);
    } else {
      await this.handlePendingDeposit(data);
    }
  }

  // Main handler that routes to chain-specific handlers
  async handleDeposit(data: DepositData): Promise<void> {
    try {
      switch (data.chainId) {
        case 'eth':
          if (data.tokenType === 'native') {
            await this.handleEthDeposit(data);
          } else if (data.tokenType === 'erc20') {
            await this.handleErc20Deposit(data);
          }
          break;
        case 'bnb':
          if (data.tokenType === 'native') {
            await this.handleBnbDeposit(data);
          } else if (data.tokenType === 'bep20') {
            await this.handleBep20Deposit(data);
          }
          break;
        default:
          console.error(`Unsupported chain: ${data.chainId}`);
      }
    } catch (error) {
      console.error('Error handling deposit:', error);
      throw error;
    }
  }
} 