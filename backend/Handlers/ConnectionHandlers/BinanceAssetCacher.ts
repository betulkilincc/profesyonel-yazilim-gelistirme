import { WebsocketClient } from "binance";
import { DBUserConnection } from "../../Types/DBTypes";
import { ConnectionAssetCacheHandler } from "../../Types/types";
import {ConnectionAssetCacher} from "../../utils/cacher/cacher"
import { WebSocket } from "ws";
import logger from "../../utils/Implementation/binancelogger";

export class BinanceAssetCacher implements ConnectionAssetCacheHandler
{
    async startCaching(userConnection: DBUserConnection):Promise< WebSocket> {
        let cacher : ConnectionAssetCacher = new ConnectionAssetCacher();
        const wsClient = new WebsocketClient(
            {
                api_key: userConnection.publicKey,
                api_secret: userConnection.secretKey,
            },
            logger
        );
        const ws = await wsClient.subscribeSpotUserDataStream(true,false) as unknown as WebSocket;
        ws.on("message",async  (data : any) => {

            const parsedData = JSON.parse(String.fromCharCode.apply(null, data)) as balanceUpdate;
            if(parsedData.e !== "balanceUpdate") return;
            
            let connectionAssets = await cacher.GetUserConnectionAssets(userConnection);

            let asset = connectionAssets.assets.find(asset => asset.ticker === parsedData.a);
            if(!asset && parsedData.a.substring(0,2) == 'LD') 
                asset = connectionAssets.assets.find(asset => asset.ticker === parsedData.a.substring(2));
            if(!asset) return;
            asset.quantity += Number(parsedData.d);

            cacher.CacheUserConnectionAssets(userConnection, connectionAssets);
        });
        return ws;
    }

}
interface balanceUpdate {
    /**Asset */
    a : string;
    /**Delta */
    d: number;
    /**Event type */
    e: string;
}

//{
//     "e": "outboundAccountPosition", //Event type
//     "E": 1564034571105,             //Event Time
//     "u": 1564034571073,             //Time of last account update
//     "B": [                          //Balances Array
//       {
//         "a": "ETH",                 //Asset
//         "f": "10000.000000",        //Free
//         "l": "0.000000"             //Locked
//       }
//     ]
//   }