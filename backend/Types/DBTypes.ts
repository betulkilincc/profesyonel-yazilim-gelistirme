import { VAssetType, VConnectionType, VTransactionType } from "./enums";

export interface DBUser {
    connections: DBUserConnection[];
    holdings : DBUserHolding[],
    previousBalance? : number,
  }
  export interface DBUserHolding {
    uid : string,
    asset: DBHoldingAsset;
    transactions: DBHoldingTransaction[];

  }
  export interface DBUserConnection {
    connection: DBConnection
    uid:string;
    publicKey: string;
    secretKey: string;
    name: string
  }
  export interface DBHoldingAsset extends DBAsset{
    type: VAssetType
  }

  export interface DBAsset{ 
    uid: string;
    name: string;
    ticker: string;
    logoURL: string;
    marketCap: number;
  }
  export interface MissingAsset{
    ticker: string;
    timeStamp: number;
  }

  export interface DBConnection {
    connectionUid : string;
    connectionName :string;
    type: VConnectionType;
    logoURL: string;
    bgColorHex: string;
    isSecretKeyRequired: boolean;
    GeneralDescription: string;
    PublicKeyDescription: string;
    PrivateKeyDescription: string;
  }
  export interface DBHoldingTransaction {
    uid: string;
    type: VTransactionType;
    quantity: number;
    pricePerLot: number;
    timestamp: number;
  }