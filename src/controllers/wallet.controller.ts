import { Context } from 'hono';
import { WalletService, TransactionService, CurrencyService, AddressService } from '@/services/index';
import { multiHget, multiHset } from '@/config/redis'

const walletService = new WalletService();
const transactionService = new TransactionService();
const currencyService = new CurrencyService();
const addressService = new AddressService();
export class WalletController {


  createWallet = async (c: Context) => {
    try {
      // const { userId } = c.get('user');
      // const { userId, userCode } = await c.req.json()
      let userId = "1234567890"
      let userCode = 123456
      const resp = await walletService.createWallet(userId, userCode);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.log("🚀 ~ WalletController ~ createWal ~ error:", error)

      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getWallets = async (c: Context) => {
    try {
      const { userId, userCode } = c.get('user');
      let resp = await walletService.getWalletById(userId);
      if (resp?.success == false && resp?.message == "WALLET_NOT_FOUND") {
        resp = await walletService.createWallet(userId, userCode);
      } else {
        // get balance in redis
        let redisBal: any = [];
        resp.data.balances.map((asset: any) => {
          redisBal.push(
            { key: `funding_bal_${asset.coinId}`, field: userCode, value: asset.funding, coinId: asset.coinId, symbol: asset.symbol },
            { key: `spot_bal_${asset.coinId}`, field: userCode, value: asset.spot, coinId: asset.coinId, symbol: asset.symbol },
            { key: `spotLock_bal_${asset.coinId}`, field: userCode, value: asset.spotLock, coinId: asset.coinId, symbol: asset.symbol },
            { key: `p2p_bal_${asset.coinId}`, field: userCode, value: asset.p2p, coinId: asset.coinId, symbol: asset.symbol },
            { key: `p2pLock_bal_${asset.coinId}`, field: userCode, value: asset.p2pLock, coinId: asset.coinId, symbol: asset.symbol },
            { key: `perpetual_bal_${asset.coinId}`, field: userCode, value: asset.perpetual, coinId: asset.coinId, symbol: asset.symbol },
            { key: `perpetualLock_bal_${asset.coinId}`, field: userCode, value: asset.perpetualLock, coinId: asset.coinId, symbol: asset.symbol },
          )
        })

        const redisResults = await multiHget(redisBal);
        if (redisResults[0] != "") {
          const balancesMap = new Map<string, any>();

          redisBal.forEach((entry, index) => {
            const { coinId, symbol, key } = entry;
            const value = Number(redisResults[index] ?? 0);

            if (!balancesMap.has(coinId)) {
              balancesMap.set(coinId, {
                coinId,
                symbol,
                funding: 0,
                spot: 0,
                spotLock: 0,
                p2p: 0,
                p2pLock: 0,
                perpetual: 0,
                perpetualLock: 0,
              });
            }

            const bal = balancesMap.get(coinId);

            if (key.startsWith("funding_bal_")) bal.funding = value;
            if (key.startsWith("spot_bal_")) bal.spot = value;
            if (key.startsWith("spotLock_bal_")) bal.spotLock = value;
            if (key.startsWith("p2p_bal_")) bal.p2p = value;
            if (key.startsWith("p2pLock_bal_")) bal.p2pLock = value;
            if (key.startsWith("perpetual_bal_")) bal.perpetual = value;
            if (key.startsWith("perpetualLock_bal_")) bal.perpetualLock = value;
          });

          const finalBalances = Array.from(balancesMap.values());
          let result = {
            _id: userId,
            userCode,
            balances: finalBalances
          }
          return c.json({ success: true, message: "SUCCESS", code: 200, data: result }, 200);
        }

        // set redis balance
        await multiHset(redisBal)
      }

      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.log("🚀 ~ WalletController ~ getWallets ~ error:", error)
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  creditAmount = async (c: Context) => {
    try {
      const { userCode } = c.get('user');
      const { currencyId, amount, walletType } = await c.req.json();
      const resp = await walletService.creditAmount(userCode, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async debitAmount(c: Context) {
    try {
      const { userCode } = c.get('user');
      const { currencyId, amount, walletType } = await c.req.json();
      const resp = await walletService.debitAmount(userCode, walletType, currencyId, amount);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async withdrawRequest(c: Context) {
    try {
      const { userId, userCode } = c.get('user');
      const { type, twoFa, address, amount, coin, coinId } = await c.req.json();
      const resp = await transactionService.withdrawRequest(userId, userCode, type, twoFa, address, amount, coin, coinId);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  async transfer(c: Context) {
    try {
      const { userId, userCode } = c.get('user');
      const { fromWallet, toWallet, amount, coinId, coin } = await c.req.json();
      const resp = await transactionService.internalTransfer(userId, userCode, fromWallet, toWallet, amount, coinId, coin);
      console.log("🚀 ~ WalletController ~ transfer ~ userId, userCode, fromWallet, toWallet, amount, coinId, coin:", userId, userCode, fromWallet, toWallet, amount, coinId, coin)
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      return c.json({ success: false, message: "INTERNAL_SERVER_ERROR" }, 500);
    }
  }

  getDepositAddress = async (c: Context) => {
    try {
      const { userCode, userId } = c.get('user');
      const { coinId, chainName } = await c.req.json();
      const resp = await addressService.getDepositAddress(userId, userCode, coinId, chainName);
      return c.json(resp, resp?.code ?? 500);
    } catch (error) {
      console.log("🚀 ~ WalletController ~ getDepositAddress= ~ error:", error)
      return c.json({
        success: false,
        message: "INTERNAL_SERVER_ERROR",
        data: null
      }, 500);
    }
  }

  ethServiceInitialization = async (c: Context) => {
    try {
      const addresses = await walletService.getAllEvmAddresses();

      const contractAddresses = await walletService.getContractAddresses();

      const adminWallet = await walletService.getAdminWalletByChain("eth");

      return c.json({
        success: true,
        message: "SUCCESS",
        data: {
          userAddresses: addresses,
          contractAddresses: contractAddresses,
          admin: adminWallet
        }
      });
    } catch (error) {
      console.error('Error in ethServiceInitialization:', error);
      return c.json({
        success: false,
        message: "INTERNAL_SERVER_ERROR",
        data: null
      }, 500);
    }
  }

} 