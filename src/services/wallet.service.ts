import { getRepository } from "@/models/repositoryFactory";
import { AddressModel, CurrencyModel, AdminWalletModel } from "@/models/schemas/index";
import { incBalanceRedis, decBalanceRedis, redis } from '@/config/redis'
import { CurrencyDocument } from "@/models/schemas/currency";
import { AdminWalletDocument } from "@/models/schemas/adminWallet";
import axios from 'axios';

const BALANCELOG = 'balance_logs';
const BALANCEGROUP = 'balance_group';
const BALANCECONSUMER = 'balance_sync_worker'

interface WalletResponse {
  success: boolean;
  message: string;
  code: number;
  data: any;
}

export class WalletService {
  private addressRep = getRepository(AddressModel);
  private currencyRep = getRepository(CurrencyModel);

  private createErrorResponse(message: string, code: number = 500): WalletResponse {
    return { success: false, message, code, data: "" };
  }

  private createSuccessResponse(data: any, message: string = "SUCCESS"): WalletResponse {
    return { success: true, message, code: 200, data };
  }

  private async generateAddress(currency: CurrencyDocument): Promise<{ address: string; privateKey: string }> {
    const serviceMap: Record<string, string> = {
      'eth': process.env.ETH_SERVICE_URL + '/wallet',
      'bnb': process.env.BNB_SERVICE_URL + '/wallet',
      'btc': process.env.BTC_SERVICE_URL + '/wallet'
    };
    console.log("serviceMap", serviceMap.eth)
    const serviceUrl = serviceMap[currency.network.toLowerCase()];
    console.log("serviceUrl", serviceUrl, currency.network)
    if (!serviceUrl) {
      throw new Error(`No service available for currency: ${currency.network}`);
    }

    try {
      const response = await axios.post(serviceUrl);
      return {
        address: response.data.address,
        privateKey: response.data.privateKey
      };
    } catch (error) {
      console.error(`Error generating address for ${currency.symbol}:`, error);
      throw error;
    }
  }

  private async generateEvmAddress(evmCurrencies: CurrencyDocument[]): Promise<{ address: string; privateKey: string }> {
    for (const currency of evmCurrencies) {
      try {
        console.log(`Attempting to generate EVM address using ${currency.network} service...`);
        const result = await this.generateAddress(currency);
        console.log(`Successfully generated EVM address using ${currency.network} service`);
        return result;
      } catch (error: any) {
        const errorMessage = `Failed to generate EVM address using ${currency.network} service. Error: ${error.message}`;
        console.error(errorMessage, { stack: error.stack, network: currency.network });
      }
      
    }
    throw new Error('Failed to generate EVM address after trying all currencies');
  }

  private isAddressComplete(addressDoc: any, evmCurrencies: CurrencyDocument[], nonEvmCurrencies: CurrencyDocument[]): boolean {
    if (!addressDoc) return false;

    if (evmCurrencies.length > 0) {
      if (!addressDoc.evm?.address || !addressDoc.evm?.privateKey) return false;
      if (!addressDoc.evm.currencies || addressDoc.evm.currencies.length !== evmCurrencies.length) return false;
    }

    if (nonEvmCurrencies.length > 0) {
      if (!addressDoc.nonEvm || addressDoc.nonEvm.length !== nonEvmCurrencies.length) return false;
      
      const nonEvmMap = new Map(addressDoc.nonEvm.map((w: any) => [w.currencyId.toString(), w]));
      return nonEvmCurrencies.every(currency => {
        const walletCurrency = nonEvmMap.get(currency._id.toString());
        return walletCurrency?.address && walletCurrency?.privateKey;
      });
    }

    return true;
  }

  async createWallet(userCode: number): Promise<WalletResponse> {
    try {
      // Get active currencies and separate them efficiently
      // const curList = await this.currencyRep.find({ isActive: true }) as CurrencyDocument[];
      const curList = [
        {
          _id: "648266666666666666666666",
          symbol: "usdt",
          isEvm: true,
          type: "token",
          tokenType: "erc20",
          network: "eth",
          isActive: true,
          contractAddress: "0x0000000000000000000000000000000000000000"
        },
        {
          _id: "648266666666666666666667",
          symbol: "eth",
          isEvm: true,
          type: "crypto",
          tokenType: "",
          network: "eth",
          isActive: true,
          contractAddress: ""
        }
      ]
      if (!curList?.length) {
        return this.createErrorResponse("CURRENCY_NOT_FOUND", 404);
      }

      const { evmCurrencies, nonEvmCurrencies } = curList.reduce((acc, currency) => {
        if (currency.isEvm) {
          acc.evmCurrencies.push(currency);
        } else {
          acc.nonEvmCurrencies.push(currency);
        }
        return acc;
      }, { evmCurrencies: [] as CurrencyDocument[], nonEvmCurrencies: [] as CurrencyDocument[] });

      const existingAddress = await this.addressRep.findOne({ userCode });
      if (existingAddress && this.isAddressComplete(existingAddress, evmCurrencies, nonEvmCurrencies)) {
        return this.createSuccessResponse(existingAddress, "WALLET_ALREADY_EXISTS");
      }

      const addressDoc = {
        userCode,
        evm: {
          address: "",
          privateKey: "",
          currencies: []
        },
        nonEvm: []
      };

      if (evmCurrencies.length > 0) {
        if (existingAddress?.evm?.address && existingAddress?.evm?.privateKey) {
          addressDoc.evm = {
            address: existingAddress.evm.address,
            privateKey: existingAddress.evm.privateKey,
            currencies: evmCurrencies.map(currency => ({
              currencyId: currency._id,
              symbol: currency.symbol
            }))
          };
        } else {
          try {
            const evmAddressData = await this.generateEvmAddress(evmCurrencies);
            addressDoc.evm = {
              address: evmAddressData.address,
              privateKey: evmAddressData.privateKey,
              currencies: evmCurrencies.map(currency => ({
                currencyId: currency._id,
                symbol: currency.symbol
              }))
            };
          } catch (error) {
            console.error("Failed to generate EVM address:", error);
            return this.createErrorResponse("FAILED_TO_GENERATE_EVM_ADDRESS");
          }
        }
      }

      const existingNonEvmMap = new Map(
        existingAddress?.nonEvm?.map((w: any) => [w.currencyId.toString(), w]) || []
      );

      for (const currency of nonEvmCurrencies) {
        const existingNonEvm = existingNonEvmMap.get(currency._id.toString());
        
        if (existingNonEvm?.address && existingNonEvm?.privateKey) {
          addressDoc.nonEvm.push({
            currencyId: currency._id,
            symbol: currency.symbol,
            address: existingNonEvm.address,
            privateKey: existingNonEvm.privateKey,
            tag: currency.network?.tag || ""
          });
        } else {
          try {
            const nonEvmAddress = await this.generateAddress(currency);
            addressDoc.nonEvm.push({
              currencyId: currency._id,
              symbol: currency.symbol,
              address: nonEvmAddress.address,
              privateKey: nonEvmAddress.privateKey,
              tag: currency.network?.tag || ""
            });
          } catch (error) {
            console.error(`Failed to generate address for ${currency.symbol}:`, error);
            return this.createErrorResponse(`FAILED_TO_GENERATE_ADDRESS_FOR_${currency.symbol}`);
          }
        }
      }

      const address = existingAddress
        ? await this.addressRep.findByIdAndUpdate(existingAddress._id, addressDoc, { new: true })
        : await this.addressRep.create(addressDoc);

      if (!address) {
        return this.createErrorResponse("INTERNAL_SERVER_ERROR");
      }

      return this.createSuccessResponse(address);
    } catch (error) {
      console.error(error, "createWallet");
      return this.createErrorResponse("INTERNAL_SERVER_ERROR");
    }
  }

  async getWalletByAddress(address: string): Promise<WalletResponse> {
    try {
      let wallet = await this.addressRep.findOne({ 'evm.address': address });
      
      if (!wallet) {
        wallet = await this.addressRep.findOne({ 'nonEvm.address': address });
      }

      if (!wallet) {
        return this.createErrorResponse("WALLET_NOT_FOUND", 404);
      }

      return this.createSuccessResponse(wallet);
    } catch (error) {
      console.error("getWalletByAddress", error);
      return this.createErrorResponse("INTERNAL_SERVER_ERROR");
    }
  }

  async getWalletByUserCode(userCode: number): Promise<WalletResponse> {
    try {
      const wallet = await this.addressRep.findOne({ userCode });
      if (!wallet) {
        return this.createErrorResponse("WALLET_NOT_FOUND", 404);
      }
      return this.createSuccessResponse(wallet);
    } catch (error) {
      console.error("getWalletByUserCode", error);
      return this.createErrorResponse("INTERNAL_SERVER_ERROR");
    }
  }

  async creditAmount(userCode: string, walletType: string, currencyId: string, amount: number): Promise<any> {
    try {

      const wallRedis = await incBalanceRedis(`${walletType}_bal_${currencyId}`, userCode, parseFloat(amount))
      if (!wallRedis) {
        return {
          success: false,
          message: "WALLET_NOT_FOUND",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: wallRedis }
    } catch (error) {
      console.error(error, "creditAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }

  }


  async debitAmount(userCode: string, walletType: string, currencyId: string, amount: number): Promise<any> {
    try {

      const wallRedis = await decBalanceRedis(`${walletType}_bal_${currencyId}`, userCode, parseFloat(amount))
      if (!wallRedis) {
        return {
          success: false,
          message: "INSUFFICIENT_BALANCE",
          code: 404,
          data: ""
        }
      }
      return { success: true, message: "SUCCESS", code: 200, data: wallRedis }
    } catch (error) {
      console.error(error, "debitAmount");
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }

    }
  }

  async redis_to_DB_bal_update(): Promise<any> {
    try {

      // iniitalze strem 
      await redis.balStream()
      let redisCli = await redis.getClient()

      while (true) {
        try {
          const entries = await redisCli.xreadgroup(
            'GROUP',
            BALANCEGROUP,
            BALANCECONSUMER,
            'BLOCK',
            5000,
            'COUNT',
            10,
            'STREAMS',
            BALANCELOG,
            '>'
          );

          if (!entries) continue;

          for (const [, messages] of entries) {
            for (const [id, fields] of messages) {
              const data: Record<string, string> = {};
              for (let i = 0; i < fields.length; i += 2) {
                data[fields[i]] = fields[i + 1];
              }
              console.log("🚀 ~ WalletService ~ redis_to_DB_bal_update ~ data:", data)
              try {

                let [walletType, , symbol] = data.wallet.split("_")

                if (data.action == "increment") {
                  await this.addressRep.updateOne(
                    {
                      userCode: data.user,
                      'assets.symbol': symbol,
                    },
                    {
                      $inc: {
                        [`assets.$.${walletType}`]: data.amount,
                      },
                    }
                  );
                } else if (data.action == "decrement") {
                  await this.addressRep.updateOne(
                    {
                      userCode: data.user,
                      'assets.symbol': symbol,
                    },
                    {
                      $inc: {
                        [`assets.$.${walletType}`]: -data.amount,
                      },
                    }
                  );
                }



                console.log(`✅ Sznced log from Redis ID ${id}`);


                await redisCli.xack(BALANCELOG, BALANCEGROUP, id); // Mark as processed
                await redisCli.xdel(BALANCELOG, id);
                console.log(`✅ Sznced log from Redis ID ${id}`);
              } catch (err) {
                console.error('❌ Failed to insert balance log:', err);
              }
            }
          }
        } catch (err) {
          console.error('❌ Redis stream processing error:', err);
        }

      }
    } catch (error) {
      console.log("🚀 ~ redis_to_DB_bal_update ~ error:", error)

    }
  }

  async getAllEvmAddresses(): Promise<string[]> {
    try {
      const addresses = await this.addressRep.find({ 'evm.address': { $exists: true } });
      return addresses.map(doc => (doc as any).evm.address);
    } catch (error) {
      console.error('Error getting EVM addresses:', error);
      throw error;
    }
  }

  async getContractAddresses(): Promise<string[]> {
    try {
      const currencies = await this.currencyRep.find({ 
        type:"token",
        tokenType:"erc20",
        isActive: true,
        'network.contractAddress': { $exists: true }
      });
      return currencies.map(currency => currency.network?.contractAddress).filter(Boolean) as string[];
    } catch (error) {
      console.error('Error getting contract addresses:', error);
      throw error;
    }
  }

  async getAdminWallet(): Promise<{ address: string; privateKey: string } | null> {
    try {
      const adminWallet = await getRepository(AdminWalletModel).findOne({ 
        'wallets.isActive': true 
      });

      if (!adminWallet) return null;

      // Get the first active wallet (you might want to specify which chain's wallet to return)
      const activeWallet = adminWallet.wallets.find(w => w.isActive);
      if (!activeWallet) return null;

      return {
        address: activeWallet.address,
        privateKey: activeWallet.privateKey
      };
    } catch (error) {
      console.error('Error getting admin wallet:', error);
      throw error;
    }
  }

  // Add method to get admin wallet for specific chain
  async getAdminWalletByChain(chainId: string): Promise<{ address: string; privateKey: string } | null> {
    try {
      const adminWallet = await getRepository(AdminWalletModel).findOne({ 
        'wallets.chainId': chainId,
        'wallets.isActive': true 
      });

      if (!adminWallet) return null;

      const chainWallet = adminWallet.wallets.find(w => w.chainId === chainId && w.isActive);
      if (!chainWallet) return null;

      return {
        address: chainWallet.address,
        privateKey: chainWallet.privateKey
      };
    } catch (error) {
      console.error(`Error getting admin wallet for chain ${chainId}:`, error);
      throw error;
    }
  }
}; 