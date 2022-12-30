import Express from "express";
import { Router } from "express-ws";
import WebSocket from "ws";
import { ConnectionHandler } from "../Handlers/ConnectionHandlers/ConnectionHandler";
import { FirebaseHandler } from "../Handlers/DBHandlers/FirebaseHandler";
import { HoldingHandler } from "../Handlers/HoldingHandler/HoldingHandler";
import { DBUser } from "../Types/DBTypes";
import { DBHandler,WsWithUserCredentials } from "../Types/types";
import Duration from "../utils/DurationHelper/Duration";


const dbHandler: DBHandler = new FirebaseHandler();
var clients: WsWithUserCredentials[] = [];

const router: Router = Express.Router() as Router;
router.ws("/", async function (ws: WebSocket, req: Express.Request | any) {
  {
    let dbUserData: DBUser = await dbHandler.GetDbUserData(req.uid as string);

    let wsWithUserData : WsWithUserCredentials = {
      dbUserData: dbUserData,
      websocket: ws
    }
    let cachingSockets = await ConnectionHandler.StartWebSocketRoutine(wsWithUserData.dbUserData);
    clients.push(wsWithUserData);
    ws.on("close", function () {
      clients.splice(clients.indexOf(wsWithUserData), 1);
      ConnectionHandler.StopCachingCoroutine(cachingSockets);
    });
  }
});
export async function startHoldingsCoroutine() {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, Duration.Second(3)));
    if (clients.length > 0) 
    {
      clients.forEach(async (c) => {
        let holdings = await HoldingHandler.GetHoldings(c.dbUserData);
        c.websocket.send(JSON.stringify(holdings));
      })
    }
  }
}


export default router;
