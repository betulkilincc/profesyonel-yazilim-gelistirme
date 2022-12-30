import { VAssetType, VConnectionType, VTransactionType } from "./enums";
import Validator from "validatorjs";

// BASE TYPES
export interface Asset {
  price: number;
  previousPrice: number;
  uid: string;
  name: string;
  ticker: string;
  logoURL: string;
  type: VAssetType;
}

export interface DBAsset {
  uid: string;
  name: string;
  ticker: string;
  logoURL: string;
  marketCap: number;
}

export interface AssetPrice {
  assetuid: string;
  price: number;
  previousprice: number;
}

export interface DBConnection {
  connectionUid: string;
  connectionName: string;
  type: VConnectionType;
  logoURL: string;
  bgColorHex: string;
  isSecretKeyRequired: boolean;
  GeneralDescription: string;
  PublicKeyDescription: string;
  PrivateKeyDescription: string;
}

export interface DBUserConnection {
  connection: DBConnection;
  uid: string;
  publicKey: string;
  secretKey: string;
  name: string;
}

export interface Holding {
  asset: Asset;
  connections: HoldingConnection[];
  transactions: Transaction[];
  quantity: number;
  value: number;
  allocationPercentage?: number;
}

export interface HoldingConnection {
  userConnection: DBUserConnection; //reference to userconnection
  quantity: number;
}

export interface Transaction {
  uid: string;
  type: VTransactionType;
  quantity: number;
  pricePerLot: number;
  timestamp: number;
}

// REQUEST TYPES
export interface CheckUserReqBody {
  email: string;
}

export interface AddUserConnectionReqBody {
  connectionUid: string;
  name: string;
  publicKey: string;
  secretKey?: string;
}

export interface UpdateUserConnectionReqBody {
  uid: string; //This is the identifier and can not be updated. Other parameters will be updated
  newName?: string;
  newPublicKey?: string;
  newSecretKey?: string;
}

export interface DeleteUserConnectionReqBody {
  uid: string;
}

export interface GetAllAssetsOfTypeReqBody {
  assetType: VAssetType;
}

export interface GetAssetPricesReqBody {
  assetUids: string[];
}

export interface AddTransactionReqBody {
  type: VTransactionType;
  assetuid: string; //reference to asset's uid, that the transaction is type of
  quantity: number;
  pricePerLot: number;
}

export interface GetTransactionsForAssetReqBody {
  assetuid: string;
}

export interface DeleteTransactionReqBody {
  transactionUid: string;
}

export interface UpdateTransactionReqBody {
  transactionUid: string;
  newType?: VTransactionType;
  newQuantity?: number;
  newPricePerLot?: number;
}

// RESPONSE TYPES
export class VResponse {
  /**Use this for easy response creation
   * @param message If you don't provide a body, it will be considered unsuccesful (isSuccesful=false)
   * @param body The body of the result
   * @param success Whether the request is succesfully satisfied
   */
  constructor(
    success: boolean,
    message?: string | Validator.Errors,
    body?: VResponseRes
  ) {
    this.isSuccesful = success ?? (body ? true : false);
    this.message = message ?? undefined;
    this.result = body ?? undefined;
  }
  isSuccesful: boolean;
  result?: VResponseRes;
  message?: string | Validator.Errors;
}

export interface VResponseRes {}

export interface GetAllConnectionsRes extends VResponseRes {
  connections: DBConnection[];
}

export interface GetAllUserConnectionsRes extends VResponseRes {
  userConnections: DBUserConnection[];
}

export interface GetAllAssetsOfTypeRes extends VResponseRes {
  assets: DBAsset[];
}

export interface GetAssetPricesRes extends VResponseRes {
  assetPrices: AssetPrice[];
}

export interface GetTransactionsForAssetRes extends VResponseRes {
  transactions: Transaction[];
}

export interface GetHoldingsRes extends VResponseRes {
  holdings: Holding[];
  totalBalance: number;
  previousTotalBalance: number;
}
