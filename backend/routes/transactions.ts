import express from "express";
import { FirebaseHandler } from "../Handlers/DBHandlers/FirebaseHandler";
import {
  AddTransactionReq,
  DeleteTransactionReq,
  GetTransactionsForAssetReq,
  UpdateTransactionReq,
  Validate,
} from "../Types/requesttypes";
import { GetTransactionsForAssetRes, VResponse } from "../Types/responsetypes";
import { DBHandler, Transaction } from "../Types/types";
const dbHandler: DBHandler = new FirebaseHandler();
const router = express.Router();
router.post(
  "/addtransaction",
  Validate("AddTransactionReq"),
  async function (req: AddTransactionReq, res: any) {
    const userUid = req.uid as string;
    await dbHandler
      .AddTransaction(userUid, req)
      .then((transUid) =>
        res.json(new VResponse(true, "Transaction Succesfully Added", transUid))
      )
      .catch((error) => res.jsonp(new VResponse(false, error.message)));
  }
);

router.get(
  "/getTransactionsForAsset",
  Validate("GetTransactionsForAssetReq"),
  async function (req: GetTransactionsForAssetReq, res) {
    await dbHandler
      .GetTransactionsForAsset(req)
      .then((transactions) => {
        let result = {
          transactions: transactions ?? [],
        } as GetTransactionsForAssetRes;
        res.json(new VResponse(true, "", result));
      })
      .catch((error) => res.jsonp(new VResponse(false, error.message)));
  }
);

router.delete("/", async function (req: DeleteTransactionReq, res) {
  dbHandler
    .DeleteTransaction(req)
    .then(() => {
      res.json(new VResponse(true, "", ""));
    })
    .catch((error) => res.jsonp(new VResponse(false, error.message)));
});

router.put(
  "/update",
  Validate("UpdateTransactionReq"),
  async function (req: UpdateTransactionReq, res: any) {
    await dbHandler
      .UpdateTransaction(req)
      .then((transaction) =>
        res.json(
          new VResponse(true, "Transaction Succesfully Updated", transaction)
        )
      )
      .catch((error) => res.jsonp(new VResponse(false, error.message)));
  }
);

export default router;
