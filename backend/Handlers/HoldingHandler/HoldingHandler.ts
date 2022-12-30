import { DBUser, DBUserHolding } from "../../Types/DBTypes";
import { VTransactionType } from "../../Types/enums";
import { GetHoldingsRes } from "../../Types/responsetypes";
import {
    Asset,
    CalculatedDBAsset,
    DBHandler,
    Holding,
    HoldingConnection,
    Transaction,
} from "../../Types/types";
import AssetTypeHandler from "../AssetHandlers/AssetTypeHandler";
import { ConnectionHandler } from "../ConnectionHandlers/ConnectionHandler";


export class HoldingHandler {
    static async GetHoldings(dbUserData: DBUser): Promise<GetHoldingsRes> {
        let holdings: Holding[] = [];
        //For transactions we might not know the asset prices
        let uidsForPrice: string[] = [];
        
        if(!dbUserData?.holdings || dbUserData.holdings.length == 0) return {holdings:[],totalBalance:0,previousTotalBalance:0};
        dbUserData.holdings.forEach((holding) => {
            uidsForPrice.push(holding.asset.uid);
        });

        
        let userConnectionsPromise = Promise.all(
            dbUserData.connections.map(async (userConnection) => {
                return await ConnectionHandler.FetchBalance(userConnection);
            })
        );
        let transactionAssetsPromise = Promise.all(
            dbUserData.holdings.map(async (holding) => {
                let CalculatedDBAsset: CalculatedDBAsset = {
                    quantity: await sumTransactions(holding),
                    asset: holding.asset,
                    type : holding.asset.type,
                    transactions: holding.transactions
                };
                return CalculatedDBAsset;
            })
        );
        let userConnections = await userConnectionsPromise;

        userConnections.forEach((uc) => {
            uc.assets.forEach((assetq) => {
                let asset = assetq as Asset;
                let singleConnection: HoldingConnection = {
                    quantity: assetq.quantity,
                    userConnection: uc.userConnection,
                };
                let holdingFragment: HoldingFragment = {
                    asset: asset,
                    connection: singleConnection,
                    transactions: [],
                    quantity: assetq.quantity,
                    value: asset.price * assetq.quantity,
                    allocationPercentage: 1,
                };
                UpsertHolding(holdings, holdingFragment);
                //todo: add connections to holdings
            });
        });

        let transactionAssets = await transactionAssetsPromise;
        let assetPrices = await AssetTypeHandler.GetValuesPerLot(uidsForPrice);
        transactionAssets.forEach((tc)=>{
          let priceBox = assetPrices.find(ap=>ap.assetuid === tc.asset.uid);
          let price = priceBox?.price ?? 0;
          let previousPrice = priceBox?.previousprice ?? 0;

          let asset: Asset = {
            ...tc.asset,
            price: price,
            previousPrice: previousPrice,
            type: tc.type
          }

          let holdingFragment: HoldingFragment = 
          {
            asset: asset,
            transactions: tc.transactions,
            quantity : tc.quantity,
            value : tc.quantity * asset.price
          }
          UpsertHolding(holdings,holdingFragment)
        });
        var total = setAllocationReturnTotal(holdings);
        
        let previousBalance : number = dbUserData.previousBalance ??  0;
        
        var result: GetHoldingsRes = {
            holdings: holdings,
            totalBalance: total,
            previousTotalBalance : previousBalance

        };
        return result;
    }
}
async function sumTransactions(dbholding: DBUserHolding): Promise<number> {
    let total = 0;
    dbholding.transactions.forEach((t) => {
        t.type === VTransactionType.Buy
            ? (total += t.quantity)
            : (total -= t.quantity);
    });
    return total;
}

function UpsertHolding(targetHoldings: Holding[], sourceHolding: HoldingFragment) {
    let existingHolding = targetHoldings.find(
        (holding) => holding.asset.uid === sourceHolding.asset.uid
    );
    
    let holdingForAdd: Holding = {
        asset: sourceHolding.asset,
        connections: sourceHolding.connection ? [sourceHolding.connection as HoldingConnection ] : [],
        transactions : sourceHolding.transactions,
        quantity: sourceHolding.quantity,
        value: sourceHolding.value,
        allocationPercentage : 0
    };
    
    if (!existingHolding) targetHoldings.push(holdingForAdd);
    else {
      if(existingHolding.asset.price === 0) existingHolding.asset.price = sourceHolding.asset.price 
      if(existingHolding.asset.previousPrice ===0 ) existingHolding.asset.previousPrice = sourceHolding.asset.previousPrice;

        UpsertConnection(existingHolding.connections, sourceHolding.connection);
        existingHolding.transactions = existingHolding.transactions.concat(
            sourceHolding.transactions
        );
        existingHolding.quantity += sourceHolding.quantity;
        existingHolding.value += sourceHolding.value;
        
    }
}

function UpsertConnection(
    connectionsTarget: HoldingConnection[],
    connectionToAdd?: HoldingConnection
) {
    if (connectionToAdd) {
        let existingConnection = connectionsTarget.find(
            (c) => c.userConnection.uid === connectionToAdd.userConnection.uid
        );
        if (!existingConnection) connectionsTarget.push(connectionToAdd);
    }
}

interface HoldingFragment {
    asset: Asset;
    connection?: HoldingConnection;
    transactions: Transaction[];
    quantity: number;
    value: number;
    allocationPercentage?: number;
}
function setAllocationReturnTotal(holdings: Holding[]) : number {
  let total = 0;
  holdings.forEach(h=>total+=h.value);
  if(total===0) holdings.forEach((h)=>{h.allocationPercentage=0})
  else holdings.forEach((h)=>{h.allocationPercentage=h.value*100/total})
  return total;
}

