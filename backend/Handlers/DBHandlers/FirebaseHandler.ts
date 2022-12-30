import { auth, firestore } from "firebase-admin";
import { DocumentData } from "firebase-admin/firestore";
import UIDGenerator from "uid-generator";
import { admindb } from "../../utils/Firebase/firebase.config";
import {
  DBAsset,
  DBConnection,
  DBHoldingTransaction,
  DBUser,
  DBUserConnection,
  DBUserHolding,
  MissingAsset,
} from "../../Types/DBTypes";
import { VAssetType } from "../../Types/enums";
import { SingleAssetTypeHandler } from "../../Types/HandlerTypes";
import {
  AddConnectionReq,
  AddTransactionReq,
  DeleteTransactionReq,
  GetTransactionsForAssetReq,
  UpdateConnectionReq,
  UpdateTransactionReq,
} from "../../Types/requesttypes";
import { DBHandler, Transaction } from "../../Types/types";
import { DBAssetCacher } from "../../utils/cacher/cacher";
import { GetTypeByUid } from "../Utils/GetAssetTypeByUid";
import { exceptionalTickers } from "../AssetHandlers/CryptoHandlers/CryptoDistributor";
import { existsSync } from "fs";


export class FirebaseHandler implements SingleAssetTypeHandler, DBHandler {
  async ReportMissingAsset(ticker: string, assetType: VAssetType): Promise<void> {
    // var docRef = admindb.collection("assetTypes").doc(assetType+"_MissingAssets");
    // await docRef.get().then(async (value) => {
    //   var content = value.data() as DocumentData;
    //   let missingAssets = content.assets as MissingAsset[];
    //   if(!missingAssets) missingAssets = [];
    //   if(missingAssets.find((a)=>a.ticker===ticker)) return;
    //   let missingAsset = {ticker:ticker, timeStamp: new Date().getUTCDate()} as MissingAsset;
    //   await docRef.update({
    //     missingAssets: firestore.FieldValue.arrayUnion(missingAsset),
    //   });
    // });
  }
  async LoadTickers(assetType: VAssetType): Promise<void> {
    var dbAssetCacher = new DBAssetCacher();
    var docRef = admindb.collection("assetTypes").doc(assetType);
    await docRef
      .get()
      .then((value) => {
        let content = value.data() as DocumentData;
        let assets = content.assets as DBAsset[];
        assets.forEach(async (asset) =>{
          dbAssetCacher.CacheAssetInfo(asset.ticker, assetType, asset);
          var alternative = exceptionalTickers.get(asset.ticker);
          if(alternative)
            dbAssetCacher.CacheAssetInfo(alternative, assetType, asset);
        }
        );
      })
      .catch(() => {});
  }
  async DeleteUser(uid: string): Promise<void> {
    await admindb
    .collection("user")
    .doc(uid)
    .delete();
  }
  async CreateUser(uid: string): Promise<void> {
    await admindb
    .collection("user")
    .doc(uid)
    .create({connections:[], holdings:[]});
  }
  async GetDbUserData(userUid: string): Promise<DBUser> {
    
    var docRef = admindb.collection("user").doc(userUid);
    return await docRef.get().then(async (value) => {
        return value.data() as DBUser;});
        
  }
  async GetTransactionsForAsset(req: GetTransactionsForAssetReq): Promise<DBHoldingTransaction[]> {
    let userUid = req.uid as string;

    var docRef = admindb.collection("user").doc(userUid);
    return await docRef
      .get()
      .then((value) => {
        let content = value.data() as DocumentData;
        let holdings = content.holdings as DBUserHolding[];
        let relevantHolding = holdings.find(
          (h) => h.asset?.uid === req.body.assetuid
        );
        if (!relevantHolding) throw new Error("Asset type couldn't be found");
        return relevantHolding.transactions;  
      });
  }
  async DeleteTransaction(req: DeleteTransactionReq): Promise<void> {
    let userUid = req.uid as string;

  var docRef = admindb.collection("user").doc(userUid);
  await docRef
    .get()
    .then(async (value) => {
      let content = value.data() as DocumentData;
      let holdings = content.holdings as DBUserHolding[];
      let relevantTransactionIndex = -1;
      let relevantHoldingIndex = holdings.findIndex((h) => {
        relevantTransactionIndex = h.transactions.findIndex(
          (t) => t.uid === req.body.transactionUid
        );
        return relevantTransactionIndex !== -1;
      });

      if (relevantTransactionIndex === -1)
        throw new Error("Transaction couldn't be found");
      holdings[relevantHoldingIndex].transactions.splice(
        relevantTransactionIndex,
        1
      );
      return holdings;
        
    }).then((holdings)=>docRef.update({ holdings: holdings }));
  }
  async UpdateTransaction(req: UpdateTransactionReq): Promise<Transaction> {
    let userUid = req.uid as string;

    var docRef = admindb.collection("user").doc(userUid);
    return await docRef.get().then(async (value) => {
      let content = value.data() as DocumentData;
      let holdings = content.holdings as DBUserHolding[];
      let relevantTransactionIndex = -1;
      let relevantHoldingIndex = holdings.findIndex((h) => {
        relevantTransactionIndex = h.transactions.findIndex(
          (t) => t.uid === req.body.transactionUid
        );
        return relevantTransactionIndex !== -1;
      });
      if (relevantTransactionIndex === -1)
        throw new Error("Transaction couldn't be found");
      let oldTransaction =
        holdings[relevantHoldingIndex].transactions[relevantTransactionIndex];

      let newTransaction: Transaction = {
        uid: req.body.transactionUid,
        type: req.body.newType ?? oldTransaction.type,
        quantity: req.body.newQuantity ?? oldTransaction.quantity,
        pricePerLot: req.body.newPricePerLot ?? oldTransaction.pricePerLot,
        timestamp: new Date().getTime(),
      };
      holdings[relevantHoldingIndex].transactions[relevantTransactionIndex] =
        newTransaction;
      await docRef.update({ holdings: holdings });
      return newTransaction;
    });
  }
  async AddTransaction(
    userUid: string,
    req: AddTransactionReq
  ): Promise<string> {
    var docRef = admindb.collection("user").doc(userUid);

    var trans: DBHoldingTransaction = {
      quantity: req.body.quantity,
      pricePerLot: req.body.pricePerLot,
      type: req.body.type,
      uid: await new UIDGenerator().generate(),
      timestamp: new Date().getTime(),
    };

    var assetUid = req.body.assetuid;

    return await docRef.get().then(async (value) => {
      let content = value.data() as DBUser;
      let holdings = content.holdings as DBUserHolding[];
      let relevantHolding = holdings.find((h) => h.asset?.uid === assetUid);
      if (relevantHolding) {
        relevantHolding.transactions ??= [];
        relevantHolding.transactions.push(trans);
      } else {
        let assetType = GetTypeByUid(assetUid);
        let assetTypes = await this.GetAllAssets(assetType);
        let dbAsset = assetTypes.find((a) => a.uid === req.body.assetuid);

        if (!dbAsset) throw new Error("Asset not found");

        let dbHoldingAsset = { ...dbAsset, type: assetType };

        let newHolding: DBUserHolding = {
          asset: dbHoldingAsset,
          transactions: [trans],
          uid: await new UIDGenerator().generate(),
        };
        holdings.push(newHolding);
      }
      await docRef.update({
        holdings: holdings,
      });
      return trans.uid;
    });
  }
  async UpdateDbUserConnection(
    userUid: string,
    req: UpdateConnectionReq
  ): Promise<void> {
    var docRef = admindb.collection("user").doc(userUid);
    await docRef.get().then(async (value) => {
      var content = value.data() as DBUser;
      let userConnections = content.connections as DBUserConnection[];
      
      let sameConnection = userConnections.find( c=> c.publicKey === req.body.newPublicKey);
      if(sameConnection !== undefined) throw new Error("Connection already exists");

      var userConIndex = userConnections.findIndex(
        (con) => con.uid === req.body.uid
      );
      if (userConIndex === -1)
        throw new Error("Connection uid couldn't be found");
      var userConOnDB = userConnections[userConIndex];
      userConnections[userConIndex] = {
        connection: userConOnDB.connection,
        publicKey: req.body?.newPublicKey ?? userConOnDB.publicKey,
        secretKey: req.body?.newSecretKey ?? userConOnDB.secretKey,
        name: req.body?.newName ?? userConOnDB.name,
        uid: req.body.uid,
      };
      await docRef.update({
        connections: userConnections,
      });
    });
  }
  async DeleteDbUserConnection(
    userUid: string,
    connectionUid: string
  ): Promise<void> {
    var docRef = admindb.collection("user").doc(userUid);
    await docRef.get().then(async (value) => {
      var content = value.data() as DBUser;
      let userConnections = content.connections;
      let userConnection = userConnections.find(
        (userCon) => userCon.uid === connectionUid
      );
      if (userConnection) {
        await docRef.update({
          connections: firestore.FieldValue.arrayRemove(userConnection),
        });
      } else throw new Error("Connection couldn't be found");
    });
    }
    async GetDbConnectionByConnectionUid(connectionUid: string): Promise<DBConnection> {
        var connectionsRef = admindb.collection("connection").doc("connection");

        return await connectionsRef
            .get()
            .then(async (value) => {
                var content = value.data() as DocumentData;
                let alldbConnections = content.connections as DBConnection[];
                let dbConnection = alldbConnections.find(
                    (con) => con.connectionUid === connectionUid
                );
                if (!dbConnection) throw new Error("Connection not found");
                return dbConnection;
            });
    }
    async GetDbConnectionByUserConnectionUid(userUid: string, connectionUid: string) : Promise<DBConnection> {
      var connectionsRef = admindb.collection("user").doc(userUid);
      return await connectionsRef
          .get()
          .then(async (value) => {
              var content = value.data() as DocumentData;
              let alluserConnections = content.connections as DBUserConnection[];
              let dbConnection = alluserConnections.find(
                  (con) => con.uid === connectionUid
              )?.connection;
              if (!dbConnection) throw new Error("Connection not found");
              return dbConnection;
          });
  }
  async AddDBUserConnection(req: AddConnectionReq): Promise<String> {
    let uid = req.uid as string;

    var newUserConnectionUid = await new UIDGenerator().generate();

    var docRef = admindb.collection("user").doc(uid);

    var content = (await docRef.get()).data() as DBUser;
    let userConnections = content.connections as DBUserConnection[];
    
    let sameConnection = userConnections.find( c=> c.publicKey === req.body.publicKey);
    if(sameConnection !== undefined) throw new Error("Connection already exists");

    return await this.GetDbConnectionByConnectionUid(req.body.connectionUid as string)
      .then(async (dbConnection) => {
        delete req.body.connectionUid;
        let userDbConnection: DBUserConnection = {
          ...req.body,
          connection: dbConnection,
          uid: newUserConnectionUid,
        };
        await docRef.update({
          connections: firestore.FieldValue.arrayUnion(userDbConnection),
        });
        return newUserConnectionUid;
      });
  }
  async GetAllConnections(): Promise<DBConnection[]> {
    var docRef = admindb.collection("connection").doc("connection");
    return await docRef.get().then(async (value) => {
      var content = value.data() as DocumentData;
      let connections = content.connections as DBConnection[];
      return connections;
    });
  }
  async GetUserConnections(userUid: string): Promise<DBUserConnection[]> {
    var userDocRef = admindb.collection("user").doc(userUid);
    return await userDocRef.get().then((value) => {
      var userContent = value.data() as DocumentData;
      let userConnections = userContent.connections as DBUserConnection[];
      return userConnections;
    });
  }

  async SaveBalance(totalBalance: number, uid: string): Promise<void> {
    var docRef = admindb.collection("user").doc(uid);
    await docRef.update({
      previousBalance: totalBalance,
    });
  }
  async GetAssetsByTickers(
    tickers: string[],
    type: VAssetType
  ): Promise<DBAsset[]> {
    var result: DBAsset[] = [];
    var dbAssetCacher = new DBAssetCacher();
    var docRef = admindb.collection("assetTypes").doc(type);
    await docRef
      .get()
      .then((value) => {
        let content = value.data() as DocumentData;
        let assets = content.assets as DBAsset[];
        result = assets.filter((a) => tickers.includes(a.ticker));
        assets.forEach(async (asset) =>
          dbAssetCacher.CacheAssetInfo(asset.ticker, type, asset)
        );
      })
      .catch(() => {});
    return result;
  }
  async GetAllAssets(type: VAssetType): Promise<DBAsset[]> {
    var result: DBAsset[] = [];
    var docRef = admindb.collection("assetTypes").doc(type);
    let dbAssetCacher = new DBAssetCacher();
    let assetTypes = await dbAssetCacher.GetAllAssets(type);
    if (assetTypes && assetTypes.length!==0) return assetTypes;
    await docRef
      .get()
      .then(async (value) => {
        let content = value.data() as DocumentData;
        result = content.assets as DBAsset[];
        dbAssetCacher.CacheAssetTypeInfo(type, result);
      })
      .catch((error) => {});
    return result;
  }
  async CheckUserExists(email:string) : Promise<boolean>{
    try{
      await auth().getUserByEmail(email);
      return true;
    }
    catch(e){
      return false;
    }
  }
}
