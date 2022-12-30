import express, { Response } from "express";
import { GetAllAssetsOfTypeReq, GetAssetPricesReq } from "../Types/requesttypes";
import { Validate } from "../Types/requesttypes";
import AssetTypeHandler from "../Handlers/AssetHandlers/AssetTypeHandler";
import { GetAllAssetsOfTypeRes, GetAssetPricesRes, VResponse } from "../Types/responsetypes";
import { DBAsset } from "../Types/DBTypes";

const router = express.Router();

router.post(
	"/assetprices",
	Validate("GetAssetPricesReq"),
	async (req: GetAssetPricesReq, res: Response) => {
		AssetTypeHandler.GetValuesPerLot(req.body.assetUids)
			.then((value) => res.json(new VResponse(true, "", new GetAssetPricesRes(value))))
			.catch((error) => res.jsonp(new VResponse(false, error.message)));
	}
);

router.get(
	"/getallassetsoftype",
	Validate("GetAllAssetsOfTypeReq"),
	async (req: GetAllAssetsOfTypeReq, res: Response) => {
		try {
			var result = await AssetTypeHandler.GetAssetsOfType(req.body.assetType);
			var response: GetAllAssetsOfTypeRes = { assets: result as DBAsset[] };
			res.json(new VResponse(true, "", response));
			return;
		} catch (error: any) {
			res.jsonp(new VResponse(false, error.message));
			return;
		}
	}
);

export default router;
