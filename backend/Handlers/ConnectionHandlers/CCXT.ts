import { AssetPrice, ConnectionService } from "../../Types/HandlerTypes";
import ccxt from "ccxt";
import { VAssetType, VConnectionType } from "../../Types/enums";
import {
  AssetQ,
  ConnectionAssets,
  PartialUserConnection,
} from "../../Types/types";
import { DBUserConnection } from "../../Types/DBTypes";
import AssetTypeHandler from "../AssetHandlers/AssetTypeHandler";
import { PriceCacher } from "../../utils/cacher/cacher";
import Duration from "../../utils/DurationHelper/Duration";
export class CCXT implements ConnectionService {
  async VerifyConnection(
    userconnection: PartialUserConnection
  ): Promise<boolean> {
    let exchange = GetExchangeByType(
      userconnection.type,
      userconnection.publicKey,
      userconnection.secretKey
    );
    let success: boolean;
    try {
      //Trying to do something that requires correct credentials, due to lack of verification method in ccxt
      await exchange.fetchBalance();
      success = true;
    } catch {
      success = false;
    }
    return success;
  }
  async GetAssets(userconnection: DBUserConnection): Promise<ConnectionAssets> {
    let exchange = GetExchangeByType(
      userconnection.connection.type,
      userconnection.publicKey,
      userconnection.secretKey
    );

    let savingAssetsInConnectionPromise = exchange.fetchTotalBalance({
      type: "savings",
    });
    let spotAssetsInConnectionPromise = exchange.fetchTotalBalance();

    let savingAssetsInConnection = await savingAssetsInConnectionPromise;
    let spotAssetsInConnection = await spotAssetsInConnectionPromise;
    let finalAssetsInConnection = MergeAssets(
      savingAssetsInConnection,
      spotAssetsInConnection
    );
    let relevantKeys = Object.keys(finalAssetsInConnection);
    let fetchTickerDictionary = await exchange.fetchTickers(
      relevantKeys.filter(rk=> rk!=='USDT' && rk!=='ETHW' && rk!=='EDG').map((rk) => rk + "/USDT")
    );
    let dbAssets = await AssetTypeHandler.GetAssetsByTickers(
      relevantKeys,
      VAssetType.Crypto
    );
    let assets = await Promise.all(
      relevantKeys.map(async (key, index) => {
        let price = 1,
          change: number,
          previousePrice = 1;
        let relevantPrices = fetchTickerDictionary[key + "/USDT"];
        if (relevantPrices) {
          price = relevantPrices.last as number;
          change = relevantPrices.change as number;
          previousePrice = price - change;
        }
        else if (key === 'USDT') {
          price = 1;
          change = 0;
          previousePrice = 1;
        }

        var dbAsset = dbAssets[index];
        if (dbAsset.name === "") {
          return emptyAssetQ;
        }

        var AssetPriceToCache: AssetPrice = {
          price: price,
          previousprice: previousePrice,
          assetuid: dbAsset.uid,
        };
        PriceCacher.cacheAssetPrice(AssetPriceToCache, Duration.Second(3)); // Not awaiting that

        let result: AssetQ = {
          price: price,
          previousPrice: previousePrice,
          ticker: key,
          uid: dbAsset.uid,
          name: dbAsset.name,
          logoURL: dbAsset.logoURL,
          type: VAssetType.Crypto,
          quantity: finalAssetsInConnection[key],
        };
        return result;
      })
    );
    let result: ConnectionAssets = {
      assets: assets,
      userConnection: userconnection,
    };
    return result;
  }
}
function GetExchangeByType(
  connectiontype: VConnectionType,
  apiKey: string,
  secret: string
): ccxt.Exchange {
  let config = { apiKey: apiKey, secret: secret };
  switch (connectiontype) {
    case VConnectionType.BinanceAccount:
      return new ccxt.binance(config);
    case VConnectionType.Kucoin:
      return new ccxt.kucoin(config);
    case VConnectionType.FTX:
      return new ccxt.ftx(config);
    case VConnectionType.Cryptocom:
      return new ccxt.cryptocom(config);
    case VConnectionType.Huobi:
      return new ccxt.huobi(config);
    case VConnectionType.Coinbase:
      return new ccxt.coinbase(config);
    case VConnectionType.Okx:
      return new ccxt.okx(config);
    case VConnectionType.Gate:
      return new ccxt.gateio(config);
    case VConnectionType.Kraken:
      return new ccxt.kraken(config);
    case VConnectionType.Ascendex:
      return new ccxt.ascendex(config);
    default:
      throw new Error("Not implemented");
  }
}

export function MergeAssets(
  savingAssetsInConnection: ccxt.PartialBalances,
  spotAssetsInConnection: ccxt.PartialBalances
): ccxt.PartialBalances {
  let result: ccxt.PartialBalances = {};
  Object.keys(savingAssetsInConnection).forEach((key) => {
    if (savingAssetsInConnection[key] > 0)
      result[key] = savingAssetsInConnection[key];
  });
  Object.keys(spotAssetsInConnection).forEach((key) => {
    if (spotAssetsInConnection[key] > 0) {
      if (
        key.substring(0, 2) === "LD" &&
        result[key.substring(2)] !== undefined
      )
        return;
      result[key] = spotAssetsInConnection[key] + (result[key] ?? 0);
    }
  });
  return result;
}
const emptyAssetQ: AssetQ = {
  price: 0,
  previousPrice: 0,
  ticker: "",
  uid: "",
  name: "Unknown",
  logoURL: "",
  type: VAssetType.Crypto,
  quantity: 0,
};
