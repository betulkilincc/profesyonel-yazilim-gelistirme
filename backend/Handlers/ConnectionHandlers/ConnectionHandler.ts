import { DBUser, DBUserConnection } from "../../Types/DBTypes";
import { VConnectionType } from "../../Types/enums";
import { ConnectionService } from "../../Types/HandlerTypes";
import { BinanceAssetCacher } from "./BinanceAssetCacher";
import { ConnectionAssets,ConnectionAssetCacheHandler, PartialUserConnection } from "../../Types/types";
import { CCXT } from "./CCXT";
import { WebSocket } from "ws";
import { ConnectionAssetCacher } from "../../utils/cacher/cacher";
import { Covalent } from "./Covalent";

const ConnectionTypeToProvider = new Map<VConnectionType, ConnectionService>();
// ConnectionTypeToProvider.set(VConnectionType.AvalaunchIDOContract,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.EthereumWallet,new Covalent());
ConnectionTypeToProvider.set(VConnectionType.AvalancheWallet,new Covalent());
ConnectionTypeToProvider.set(VConnectionType.BinanceAccount, new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Kucoin,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.FTX,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Cryptocom,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Huobi,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Coinbase,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Okx,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Gate,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Gate,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Kraken,new CCXT());
ConnectionTypeToProvider.set(VConnectionType.Ascendex,new CCXT());

const ConnectionTypeToSocket = new Map<
  VConnectionType,
  ConnectionAssetCacheHandler
>();

ConnectionTypeToSocket.set(
  VConnectionType.BinanceAccount,
  new BinanceAssetCacher()
);

export class ConnectionHandler {
  static async FetchBalance(
    userConnection: DBUserConnection
  ): Promise<ConnectionAssets> {
    let cacher = new ConnectionAssetCacher();
    let result = await cacher.GetUserConnectionAssets(userConnection);
    if (!result) {
      let provider = ConnectionTypeToProvider.get(
        userConnection.connection.type
      );
      if (!provider) throw new Error("Provider not implemented");
      result = await provider.GetAssets(userConnection);
      //intentionally not awaited
      cacher.CacheUserConnectionAssets(userConnection, result);
    }

    return result;
  }

  static async StartWebSocketRoutine(dbUserData: DBUser): Promise<WebSocket[]> {
    if(!dbUserData?.connections || dbUserData.connections.length == 0) return [];
    let sockets =  await Promise.all(
      dbUserData.connections.map(async (userConnection) => {
        let provider = ConnectionTypeToSocket.get(
          userConnection.connection.type
        );
        if (!provider) return null;;
        let socket = await provider.startCaching(userConnection);
        return socket;
      })
    );
    sockets = sockets.filter((socket) => socket != null);
    return sockets as WebSocket[];
  }
  static async StopCachingCoroutine(cachingSockets: WebSocket[]) {
    cachingSockets.forEach(ws => ws.close());
  }

    static async VerifyAccount(userConnection: PartialUserConnection): Promise<boolean> {
        let provider = ConnectionTypeToProvider.get(userConnection.type);
        if (!provider) throw new Error('Provider not implemented');
        var result = await provider.VerifyConnection(userConnection);
        return result;
    }

}