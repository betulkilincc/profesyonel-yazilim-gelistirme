import { DBAsset } from "../../../../Types/DBTypes";
import { VAssetType } from "../../../../Types/enums";
import {
  AssetPrice,
  PriceHandler,
  SingleAssetTypeHandler,
} from "../../../../Types/HandlerTypes";
import { requests } from "../../../../utils/axiosHelper/api";

export class CryptoRank implements PriceHandler, SingleAssetTypeHandler {
  apiKey = process.env.CRYPTORANK_PRIVATE_KEY as string;
  apiHost = process.env.CRYPTORANK_API_HOST as string;
  endpoints = {
    getAssetsOfType: this.apiHost + "currencies",
  };
  limit = 20000;

  async LoadTickers(assetType: VAssetType): Promise<void> {
    // var dbAssetCacher = new DBAssetCacher();

    // var assets = await this.GetAllAssets(assetType);

    // assets.forEach(async (asset) =>{
    //   dbAssetCacher.CacheAssetInfo(asset.ticker, assetType, asset);
    //   var alternative = exceptionalTickers.get(asset.ticker);
    //   if(alternative)
    //     dbAssetCacher.CacheAssetInfo(alternative, assetType, asset);
    // }
    // );
  }
  async GetAllAssets(type: VAssetType): Promise<DBAsset[]> {
    var response = await requests.get(
      this.endpoints.getAssetsOfType +
        "?api_key=" +
        this.apiKey +
        "&limit=" +
        this.limit+
        "&optionalFields=images",
      {}
    );
    var resultArray = await this.turnDataIntoDbAsset(response.data);
    return resultArray;
  }
  async GetAssetsByTickers(
    tickers: string[],
    type: VAssetType
  ): Promise<DBAsset[]> {
    var tickersString = tickers.join(",");
    var response = await requests.get(
      this.endpoints.getAssetsOfType +
        "?api_key=" +
        this.apiKey +
        "&symbols=" +
        tickersString,
      {}
    );
    var resultArray = await this.turnDataIntoDbAsset(response.data);
    return resultArray; 
  }
  private async turnDataIntoDbAsset(data: any): Promise<DBAsset[]> {
    var resultArray = Object.keys(data).map((value, index) => {
      var asset: DBAsset = {
        uid: data[index].id,
        name: data[index].name,
        ticker: data[index].symbol,
        marketCap: data[index].values.USD.marketCap,
        logoURL: data[index].images["200x200"],
      };
      return asset;
    });
    return resultArray;
  }

  async GetValuesPerLot(assetuids: string[]): Promise<AssetPrice[]> {
    var tickersString = assetuids.join(",");
    var response = await requests.get(
      this.endpoints.getAssetsOfType +
        "?api_key=" +
        this.apiKey +
        "&ids=" +
        tickersString,
      {}
    );
    return Object.keys(response.data).map((coin: any): AssetPrice => {
      const assetprice: AssetPrice = {
        assetuid: response.data[coin].id,
        price: response.data[coin].values.USD.price,
        previousprice: 0,
      };
      var change: number = response.data[coin].values.USD.percentChange24h;
      var prev_to_current_rate: number = 100 / (100 + change);
      assetprice.previousprice =
        (assetprice.price as number) * prev_to_current_rate;
      return assetprice;
    });

  }
}
