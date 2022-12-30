import { Asset, DBAsset } from "../vealthAPI/types";

export function AssetToDBAsset(asset: Asset) {
  return {
    uid: asset.uid,
    name: asset.name,
    ticker: asset.ticker,
    logoURL: asset.logoURL,
  } as DBAsset;
}
