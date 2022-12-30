import { DBAsset, DBConnection, DBHoldingAsset, DBHoldingTransaction, DBUser, DBUserConnection, DBUserHolding } from "./DBTypes";
import { VAssetType, VConnectionType, VTransactionType } from "./enums";

export const mockDBConnection: DBConnection = {
    type: VConnectionType.AvalancheWallet,
    logoURL: "mockstring",
    bgColorHex: "mockstring",
    isSecretKeyRequired: true,
    connectionName: "mockconnectionName",
    connectionUid: "mockConnectionUid",
    GeneralDescription: "",
    PublicKeyDescription: "",
    PrivateKeyDescription: ""
};

export const mockDBHoldingTransaction : DBHoldingTransaction = 
{
    uid: 'mockuid',
    type: VTransactionType.Buy,
    quantity: 10,
    pricePerLot: 1,
    timestamp: 189274
}

export const mockDBUserConnection: DBUserConnection = {
	connection: mockDBConnection,
	uid : 'mockuid',
	publicKey: "mockstring",
	secretKey: "mockstring",
	name: 'mockname'
};
export const mockDbAsset : DBAsset={
    uid: 'cr_1',
    name: 'bitcoin',
    ticker: 'btc',
    logoURL: 'http://idontknow',
    marketCap: 100
}

export const mockDbHoldingAsset :  DBHoldingAsset = {
    type: VAssetType.Crypto,
    ...mockDbAsset
  }

export const mockDBUserHolding: DBUserHolding = {
    uid: 'mockuid',
    asset: mockDbHoldingAsset,
    transactions : [mockDBHoldingTransaction]
}


  


export const mockUser: DBUser = {
    connections: [mockDBUserConnection],
    holdings: [mockDBUserHolding],
  };