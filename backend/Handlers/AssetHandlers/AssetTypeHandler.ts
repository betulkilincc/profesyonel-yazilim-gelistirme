import { VAssetType } from "../../Types/enums";
import { DBAssetCacher, PriceCacher } from "../../utils/cacher/cacher";
import { CryptoHandler } from "./CryptoHandlers/CryptoDistributor";
import Duration from "../../utils/DurationHelper/Duration";
import {
  AssetPrice,
  PriceHandler,
  SingleAssetTypeHandler,
} from "../../Types/HandlerTypes";
import { DBAsset } from "../../Types/DBTypes";
import { FirebaseHandler } from "../DBHandlers/FirebaseHandler";
import { GetTypeByUid } from "../Utils/GetAssetTypeByUid";
import assetPriceEventEmitter from "../../Events/AssetPricesRequested";
import { CryptoRank } from "./CryptoHandlers/CryptoRank/Cryptorank";
import { DBHandler } from "../../Types/types";

const AssetTypeToPriceHandler = new Map<VAssetType, PriceHandler>();
AssetTypeToPriceHandler.set(VAssetType.Crypto, new CryptoHandler());

const SingleAssetTypeHandlers = new Map<VAssetType, SingleAssetTypeHandler[]>();
SingleAssetTypeHandlers.set(VAssetType.Crypto, [
  new FirebaseHandler(),
  // new CryptoRank(),
  // new CoinMarketCap(),
]);

const dbHandler = new FirebaseHandler() as DBHandler;

//  (assetUids: string[]): Promise<AssetPrice[]
export default class AssetTypeHandler {
  /**
   * Distributes assetsuids among respective asset handlers and gets the prices
   * @param assetUids Uids of the assets, which can be of different types
   */

  static async GetValuesPerLot(assetUids: string[]): Promise<AssetPrice[]> {
    assetPriceEventEmitter.emit(assetPriceEventEmitter.RequestedEvent);
    var AssetTypeMap = new Map<VAssetType, string[]>();
    var cachedPrices: AssetPrice[] = [];

    await Promise.all(
      assetUids.map(async (assetuid) => {
        var cachedPrice = PriceCacher.getCachedPrice(assetuid);
        if (cachedPrice) {
          cachedPrices.push(cachedPrice);
          return;
        } else {
          let type = GetTypeByUid(assetuid);
          let array = AssetTypeMap.get(type);
          if (!array) array = [];
          array.push(assetuid);
          AssetTypeMap.set(type, array);
        }
      })
    );

    var assetHandlerPromises: Promise<AssetPrice[]>[] = [];
    AssetTypeMap.forEach((uids, assetType) => {
      var handler = AssetTypeToPriceHandler.get(assetType);
      if (!handler)
        throw new Error(
          `Price information for ${assetType} is not implemented`
        );
      assetHandlerPromises.push(handler.GetValuesPerLot(uids));
    });
    var calculatedPricesArray = await Promise.all(assetHandlerPromises);
    var calculatedPrices = calculatedPricesArray.flat();

    //this is intentionally made async foreach since returning the values shouldn't wait for caching them
    calculatedPrices.forEach(async (price) =>
      PriceCacher.cacheAssetPrice(
        price,
        GetPriceCacheDurationByAssetType(GetTypeByUid(price.assetuid))
      )
    );

    return cachedPrices.concat(calculatedPrices);
  }
  static async GetAssetsOfType(type: VAssetType): Promise<DBAsset[]> {
    let cacheHandler = new DBAssetCacher();
    var result = await cacheHandler.GetAllAssets(type);
    if (result) return result;
    let handlers = SingleAssetTypeHandlers.get(type);
    if (!handlers)
      throw new Error(`Asset type information for ${type} is not implemented`);
    for (const handler of handlers) {
      var result = await handler.GetAllAssets(type);
      if (result) {
        cacheHandler.CacheAssetTypeInfo(type, result);
        return result;
      }
    }
    return [];
  }
  static async GetAssetsByTickers(
    tickers: string[],
    assetType: VAssetType
  ): Promise<DBAsset[]> {
    let cacheHandler = new DBAssetCacher();

    var handlers = SingleAssetTypeHandlers.get(assetType);
    var handlerIndex = 0,
      handlersLength = handlers ? handlers.length : 0;
    var handlerPromises: Promise<void>[] = [];

    return Promise.all(
      tickers.map(async (ticker) => {
        var cachedAsset = await cacheHandler.GetAssetByTicker(
          ticker,
          assetType
        );
        if (cachedAsset) {
          return cachedAsset;
        } else {
          do {
            if (handlerPromises.length > handlerIndex)
              await handlerPromises[handlerIndex];
            else {
              var handler = (handlers as SingleAssetTypeHandler[])[
                handlerIndex
              ];
              if (!handler)
                throw new Error(
                  `Asset type information for ${assetType} is not implemented`
                );
              var promise = handler.LoadTickers(assetType);
              handlerPromises.push(promise);
              await promise;
              handlerIndex++;
            }
            var asset = await cacheHandler.GetAssetByTicker(ticker, assetType);
            if (asset) {
              return asset;
            }
          } while (handlerIndex < handlersLength);
          dbHandler.ReportMissingAsset(ticker, assetType);
          return emptyDbAsset;
        }
      })
    );
  }
}
function GetPriceCacheDurationByAssetType(type: VAssetType): number {
  switch (type) {
    case VAssetType.Crypto:
      return Duration.Second(3);
    default:
      return Duration.Minute(1);
  }
}

const emptyDbAsset: DBAsset = {
  uid: "",
  ticker: "",
  name: "",
  logoURL: "",
  marketCap: 0,
};
