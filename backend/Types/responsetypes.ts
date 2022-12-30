import { Holding, Transaction } from "./types";
import Validator from "validatorjs";
import { AssetPrice } from "./HandlerTypes";
import { DBAsset, DBConnection, DBUserConnection } from "./DBTypes";

export class VResponse {
	/**Use this for easy response creation
	 * @param message If you don't provide a body, it will be considered unsuccesful (isSuccesful=false)
	 * @param body The body of the result
	 * @param success Whether the request is succesfully satisfied
	 */
	constructor(success: boolean, message?: string | Validator.Errors, body?: VResponseRes) {
		this.isSuccesful = success ?? (body ? true : false);
		this.message = message ?? undefined;
		this.result = body ?? undefined;
	}
	isSuccesful: boolean;
	result?: VResponseRes;
	message?: string | Validator.Errors;
}

export interface VResponseRes {}

export class GetAssetPricesRes implements VResponseRes {
	constructor(prices: AssetPrice[]) {
		this.assetPrices = prices;
	}
	assetPrices: AssetPrice[];
}

export interface GetAllAssetsOfTypeRes extends VResponseRes {
	assets: DBAsset[];
}

export interface GetHoldingsRes extends VResponseRes {
	holdings: Holding[];
	totalBalance: number;
	previousTotalBalance: number;
}

export interface GetTransactionsForAssetRes extends VResponseRes {
	transactions: Transaction[];
}

export interface GetAllConnectionsRes extends VResponseRes {
	connections: DBConnection[];
}

export interface GetAllUserConnectionsRes extends VResponseRes {
	userConnections: DBUserConnection[];
}

export interface UserSigninRes extends VResponseRes {
	accessToken: string;
}
