import { Response } from "express";
import cache from "memory-cache";
import { DBAsset, DBUserConnection } from "../../Types/DBTypes";
import { VAssetType } from "../../Types/enums";
import { AssetPrice, SingleAssetTypeHandler } from "../../Types/HandlerTypes";
import { BaseAuthRequest } from "../../Types/requesttypes";
import { ConnectionAssets } from "../../Types/types";
import Duration from "../DurationHelper/Duration";

export class PriceCacher {
  static async cacheAssetPrice(assetprice: AssetPrice,duration: number) {

    var key = "ap_" + assetprice.assetuid;
    cache.put(key, assetprice, duration);
  }
  static getCachedPrice(assetuid: string): AssetPrice | undefined {

    var key = "ap_" + assetuid;
    var x = cache.get(key) as AssetPrice;
    return x;
  }
}
export class DBAssetCacher 
{
  getAssetTypeKey = (type: VAssetType) => "asi_" + type;
  async GetAllAssets(type:VAssetType): Promise<DBAsset[]> {
    let key = this.getAssetTypeKey(type);
    var result = cache.get(key) as DBAsset[];
    return result;
  }
  async CacheAssetTypeInfo(type: VAssetType,assetinfo: DBAsset[])
  {
    let key = this.getAssetTypeKey(type);
    cache.put(key,assetinfo,Duration.Day(1))
  }

  getAssetKey = (ticker: string,assetType: VAssetType) => "ast_" + assetType + "tic_" + ticker 
  async GetAssetByTicker(ticker: string,assetType: VAssetType ) : Promise<DBAsset> {

    let key = this.getAssetKey(ticker,assetType);
    var result = cache.get(key) as DBAsset;
    return result;
  }
  async CacheAssetInfo(ticker: string, assetType: VAssetType,assetinfo: DBAsset)
  {
    let key = this.getAssetKey(ticker,assetType);
    cache.put(key,assetinfo,Duration.Day());
  }

}
export class ConnectionAssetCacher{
  getUserConnectionKey = (dbuc: DBUserConnection) => "asi_" + dbuc.uid;
  async CacheUserConnectionAssets(dbuc: DBUserConnection,assets: ConnectionAssets)
  {
    let key = this.getUserConnectionKey(dbuc);
    cache.put(key,assets,Duration.Day());
  }
  async GetUserConnectionAssets(dbuc: DBUserConnection): Promise<ConnectionAssets> {
    let key = this.getUserConnectionKey(dbuc);
    var result = cache.get(key) as ConnectionAssets;
    return result;
  }

}

interface ExtendedResponse extends Response {
  tmpResJson?(body: any): any;
}
const cacheMiddleware = function (
  duration: number,
  isUserSpecific: boolean
): any {
  return (req: BaseAuthRequest, res: Response, next: any) => {
    let key: string =
      "__express__" + (isUserSpecific ? (req.uid as string) : "" )+ req.url;
    let cachedBody = cache.get(key);
    if (cachedBody) {
      res.json(cachedBody);
      return;
    } else {
      let tmp: ExtendedResponse = res;
      tmp.tmpResJson = res.json;
      res.json = (body: any): any => {
        cache.put(key, body, duration);
        if (tmp.tmpResJson) tmp.tmpResJson(body);
      };
    }
    next();
  };
};
export default cacheMiddleware;
