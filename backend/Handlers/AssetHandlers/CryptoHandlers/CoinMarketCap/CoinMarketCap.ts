
import { AxiosRequestHeaders } from "axios";
import { requests } from "../../../../utils/axiosHelper/api";
import { CryptoLogosCC } from "./CryptoLogosCC";
import { AssetLogoHandler, AssetPrice, PriceHandler, SingleAssetTypeHandler } from "../../../../Types/HandlerTypes";
import { DBAsset } from "../../../../Types/DBTypes";
import { VAssetType } from "../../../../Types/enums";
import { DBAssetCacher } from "../../../../utils/cacher/cacher";
import { exceptionalTickers } from "../CryptoDistributor";

export class CoinMarketCap
  implements PriceHandler, SingleAssetTypeHandler
{
  async LoadTickers(assetType: VAssetType): Promise<void> {
    var dbAssetCacher = new DBAssetCacher();

    var assets = await this.GetAllAssets(assetType);

    assets.forEach(async (asset) => {
      dbAssetCacher.CacheAssetInfo(asset.ticker, assetType, asset);
      var alternative = exceptionalTickers.get(asset.ticker);
      if (alternative)
        dbAssetCacher.CacheAssetInfo(alternative, assetType, asset);
    });

  }
  async GetAssetsByTickers(tickers: string[], type: VAssetType): Promise<DBAsset[]> {
    throw new Error("Method not implemented.");
  }
  
  headers: AxiosRequestHeaders = {
    "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_PRIVATE_KEY as string,
  };
  endpoints = {
    getValuesPerLot:
      (process.env.COINMARKETCAP_API_HOST as string) +
      "v2/cryptocurrency/quotes/latest",
    getAssetsOfType:
      (process.env.COINMARKETCAP_API_HOST as string) + "v1/cryptocurrency/map",
  };
  logoHandler: AssetLogoHandler = new CryptoLogosCC();
  
  async GetAllAssets(type: VAssetType): Promise<DBAsset[]> {
    const response = await requests.get(
      this.endpoints.getAssetsOfType,
      this.headers
    );
    const data = response.data;
    var resultArray = Object.keys(data).map((value, index) => {
      var asset: DBAsset = {
        marketCap: data[value].market_cap_usd,
        uid: data[index].id,
        name: data[index].name,
        ticker: data[index].symbol,
        logoURL: 'https://s2.coinmarketcap.com/static/img/coins/200x200/'+index+'.png'
        
      };
      return asset;
    });
    // await this.logoHandler.fillLogos(resultArray);
    return resultArray;
  }
  async GetValuesPerLot(assetuids :string[],
    ): Promise<AssetPrice[]> {
    var ids = assetuids.join(",");
    var response = await requests.get(
      this.endpoints.getValuesPerLot + "?id=" + ids,
      this.headers
    );
    return Object.keys(response.data).map((coin: any): AssetPrice => {
      const assetprice: AssetPrice = {
        assetuid: response.data[coin].id,
        price: response.data[coin].quote.USD.price,
        previousprice: 0,
      };
      var change: number = response.data[coin].quote.USD.percent_change_24h;
      var prev_to_current_rate: number = 100 / (100 + change);
      assetprice.previousprice =
        (assetprice.price as number) * prev_to_current_rate;
      return assetprice;
    });
  }
}

