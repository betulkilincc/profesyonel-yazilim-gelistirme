import { DBAsset, DBUserConnection } from "./DBTypes";
import { VAssetType } from "./enums";
import { ConnectionAssets, PartialUserConnection } from "./types";

export interface AssetPrice {
    assetuid: string;
    price: number;
    previousprice: number;
  }
  
  export interface PriceHandler {
    GetValuesPerLot(assetuids: string[]): Promise<AssetPrice[]>;
  }
  export interface ConnectionService {
      GetAssets(connection: DBUserConnection): Promise<ConnectionAssets>;
      VerifyConnection(connection: PartialUserConnection): Promise<boolean>;
  }
  export interface SingleAssetTypeHandler {
    LoadTickers(assetType: VAssetType) : Promise<void>;
    GetAllAssets(type: VAssetType): Promise<DBAsset[]>;
    GetAssetsByTickers(tickers: string[],type:VAssetType): Promise<DBAsset[]>;

  }

  export interface AssetLogoHandler {
    fillLogos(assets: DBAsset[]): void;
  }