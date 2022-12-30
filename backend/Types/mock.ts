import { Asset, Holding, HoldingConnection, Transaction } from "./types";
import { VAssetType, VConnectionType, VTransactionType } from "./enums";
import { DBConnection, DBUser, DBUserConnection } from "./DBTypes";

export const mockAsset: Asset = {
  uid: "mockstring",
  type: VAssetType.Cash,
  name: "mockstring",
  ticker: "mockstring",
  logoURL: "mockstring",
  price: 1234,
  previousPrice: 1234,
};

export const mockTransaction: Transaction = {
  uid: "mockstring",
  type: VTransactionType.Buy,
  quantity: 1234,
  pricePerLot: 1234,
  timestamp: new Date().getTime(),
};

const mockDbConnection: DBConnection = 
{
  connectionUid: "",
  connectionName: "",
  type: VConnectionType.EthereumWallet,
  logoURL: "",
  bgColorHex: "",
  isSecretKeyRequired: false,
  GeneralDescription: "",
  PublicKeyDescription: "",
  PrivateKeyDescription: ""
}
export const mockDBUserConnection : DBUserConnection = 
{
  connection: mockDbConnection,
  uid: "",
  publicKey: "",
  secretKey: "",
  name: ""
}

export const mockHoldingConnection: HoldingConnection = {
  userConnection: mockDBUserConnection, //reference to userconnection
  quantity: 1,
};


export const mockHolding: Holding = {
  asset: mockAsset,
  connections: [mockHoldingConnection],
  transactions: [mockTransaction],
  quantity: 1234,
  value: 1234,
  allocationPercentage: 1234,
};

