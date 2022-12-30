import express, { Response } from "express";
import { ConnectionHandler } from "../Handlers/ConnectionHandlers/ConnectionHandler";
import { FirebaseHandler } from "../Handlers/DBHandlers/FirebaseHandler";
import {
  AddConnectionReq,
  BaseAuthRequest,
  DeleteConnectionReq,
  UpdateConnectionReq,
  Validate,
} from "../Types/requesttypes";
import {
  GetAllConnectionsRes,
  GetAllUserConnectionsRes,
  VResponse,
} from "../Types/responsetypes";
import { DBHandler, PartialUserConnection } from "../Types/types";
import cache from "../utils/cacher/cacher";
import Duration from "../utils/DurationHelper/Duration";

const dbHandler: DBHandler = new FirebaseHandler();
const router = express.Router();
router.get("/", async (req: BaseAuthRequest, res: Response) => {
  let uid = req.uid as string;
  await dbHandler
    .GetUserConnections(uid)
    .then((userConnections) => {
      let result: GetAllUserConnectionsRes = {
        userConnections: userConnections,
      };
      res.json(new VResponse(true, undefined, result));
    })
    .catch((error) => {
      res.jsonp(new VResponse(false, error.message as string));
    });
});
router.get(
  "/all",
  cache(Duration.Hour(2), false),
  async (req: BaseAuthRequest, res: Response) => {
    await dbHandler
      .GetAllConnections()
      .then((connections) => {
        let connectionsRes: GetAllConnectionsRes = {
          connections: connections,
        };
        let response = new VResponse(true, undefined, connectionsRes);
        res.json(response);
      })
      .catch((error) => {
        res.jsonp(new VResponse(false, error.message as string));
      });
  }
);
/**
 * Returns the the new uid back
 */
router.post(
  "/add",
  Validate("AddConnectionReq"),
  async function (req: AddConnectionReq, res) {
    try {
      let dbConnection = await dbHandler.GetDbConnectionByConnectionUid(
        req.body.connectionUid as string
      );

      let tmpConnection: PartialUserConnection = {
        publicKey: req.body.publicKey,
        secretKey: req.body.secretKey,
        type: dbConnection.type,
      };

      let valid = await ConnectionHandler.VerifyAccount(tmpConnection);
      if (!valid) {
        res.jsonp(new VResponse(false, "Invalid connection credentials"));
        return;
      }

      dbHandler
        .AddDBUserConnection(req)
        .then((uid) => {
          res.json(new VResponse(true, "Connection succesfully added", uid));
        })
        .catch((error) =>
          res.jsonp(new VResponse(false, error.message as string))
        );
    } catch (error : any) {
      res.jsonp(new VResponse(false, error.message as string));
    }
  }
);

router.delete(
  "/",
  Validate("DeleteConnectionReq"),
  async function (req: DeleteConnectionReq, res) {
    await dbHandler
      .DeleteDbUserConnection(req.uid as string, req.body.uid)
      .then(() =>
        res.json(new VResponse(true, "Connection succesfuly deleted"))
      )
      .catch((error) => res.jsonp(new VResponse(false, error.message)));
  }
);
/**
 * Returns new userConnection with updated values
 */

router.put(
  "/update",
  Validate("UpdateConnectionReq"),
  async (req: UpdateConnectionReq, res: Response) => {
    try {
    let dbConnection = await dbHandler.GetDbConnectionByUserConnectionUid(
      req.uid as string,
      req.body.uid as string
    );

    let tmpConnection: PartialUserConnection = {
      publicKey: req.body.newPublicKey as string,
      secretKey: req.body.newSecretKey as string,
      type: dbConnection.type,
    };

    let valid = await ConnectionHandler.VerifyAccount(tmpConnection);
    if (!valid) {
      res.jsonp(new VResponse(false, "Invalid connection credentials"));
      return;
    }

    await dbHandler
      .UpdateDbUserConnection(req.uid as string, req)
      .then(() =>
        res.json(new VResponse(true, "Connection succesfully updated"))
      )
      .catch((error) => res.jsonp(new VResponse(false, error.message)));
  }
  catch (error : any) {
    res.jsonp(new VResponse(false, error.message as string));
  }});

export default router;
