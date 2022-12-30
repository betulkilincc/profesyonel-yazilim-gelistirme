import {
  DBAsset,
  DBConnection,
  DBHoldingTransaction,
  DBUser,
  DBUserConnection,
} from "./DBTypes";
import { VAssetType, VConnectionType, VTransactionType } from "./enums";
import {
  AddConnectionReq,
  AddTransactionReq,
  DeleteTransactionReq,
  GetTransactionsForAssetReq,
  UpdateConnectionReq,
  UpdateTransactionReq,
} from "./requesttypes";
import { WebSocket } from "ws";
export interface PartialUserConnection {
  type: VConnectionType;
  publicKey: string;
  secretKey: string;
}

export interface Asset {
  price: number;
  previousPrice: number;
  uid: string;
  name: string;
  ticker: string;
  logoURL: string;
  type: VAssetType;
}
/**
 * Assets with quantity: Useful for assets fetched from a connection
 */
export interface AssetQ extends Asset {
  quantity: number;
}
/**
 * Typically result for a transaction calculation
 */
export interface CalculatedDBAsset {
  quantity: number;
  asset: DBAsset;
  type: VAssetType;
  transactions: Transaction[];
}
export interface DBHandler {
  ReportMissingAsset(ticker: string, assetType: VAssetType) : Promise<void>;
  DeleteUser(uid: string): Promise<void>;
  CreateUser(uid: string): Promise<void>;
  GetDbUserData(userUid: string): Promise<DBUser>;
  GetTransactionsForAsset(
    req: GetTransactionsForAssetReq
  ): Promise<DBHoldingTransaction[]>;
  DeleteTransaction(req: DeleteTransactionReq): Promise<void>;
  UpdateTransaction(req: UpdateTransactionReq): Promise<Transaction>;
  AddTransaction(userUid: string, req: AddTransactionReq): Promise<string>;
  UpdateDbUserConnection(
    userUid: string,
    req: UpdateConnectionReq
  ): Promise<void>;
  DeleteDbUserConnection(userUid: string, connectionUid: string): Promise<void>;
  AddDBUserConnection(req: AddConnectionReq): Promise<String>;
  GetAllConnections(): Promise<DBConnection[]>;
  GetUserConnections(userUid: string): Promise<DBUserConnection[]>;
  SaveBalance(totalBalance: number, uid: string): Promise<void>;
  GetAssetsByTickers(tickers: string[], type: VAssetType): Promise<DBAsset[]>;
  GetAllAssets(type: VAssetType): Promise<DBAsset[]>;
  CheckUserExists(email: string): Promise<boolean>;
  GetDbConnectionByConnectionUid(connectionUid: string): Promise<DBConnection>;
  GetDbConnectionByUserConnectionUid(
    userUid: string,
    connectionUid: string
  ): Promise<DBConnection>;
}
export interface ConnectionHandler {
  target: VConnectionType;
  keys: { public: string; secret: string };
  endpoints: {};
  fetchHoldings(userConnection: DBUserConnection): Holding[];
}
export interface ConnectionAssetCacheHandler
{
  startCaching(userConnection: DBUserConnection) : Promise<WebSocket>;
}
export interface Holding {
  asset: Asset;
  connections: HoldingConnection[];
  transactions: Transaction[];
  quantity: number;
  value: number;
  allocationPercentage?: number;
}
/**
 * This is a calculated interface
 */
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

export interface ConnectionAssets {
  assets: AssetQ[];
  userConnection: DBUserConnection;
}
export interface WsWithUserCredentials {
  dbUserData: DBUser;
  websocket: WebSocket;
}
