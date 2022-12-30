import express, { Response } from "express";
import { FirebaseHandler } from "../Handlers/DBHandlers/FirebaseHandler";
import { HoldingHandler } from "../Handlers/HoldingHandler/HoldingHandler";
import { BaseAuthRequest } from "../Types/requesttypes";
import { VResponse } from "../Types/responsetypes";
import { DBHandler } from "../Types/types";

const router = express.Router();
const dbHandler: DBHandler = new FirebaseHandler();
router.get("/", async (req: BaseAuthRequest, res: Response) => {
	await dbHandler
		.GetDbUserData(req.uid as string)
		.then((userData) => HoldingHandler.GetHoldings(userData))
		.then(async (holdings) => {
			res.json(new VResponse(true, "", holdings));
			await dbHandler.SaveBalance(holdings.totalBalance, req.uid as string);
		})
		.catch((error) => res.json(new VResponse(false, error.message)));
});

export default router;
