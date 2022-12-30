import { VAssetType } from "../../Types/enums";

export function GetTypeByUid(assetuid: string): VAssetType {
    switch (assetuid.substring(0, 3)) {
        case "cr_":
            return VAssetType.Crypto;
        case "eq_":
            return VAssetType.Equity;
        case "co_":
            return VAssetType.Commodity;
        case "fi_":
            return VAssetType.FixedIncome;
        case "re_":
            return VAssetType.RealEstate;
        case "ca_":
            return VAssetType.Cash;
        case "ot_":
            return VAssetType.Other;
        default:
            throw new Error("Asset uid couldn't be recognized : " + assetuid);
    }
}