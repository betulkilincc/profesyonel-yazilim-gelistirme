import Express from "express";
import WebSocket from "ws";
import { Router } from "express-ws";
import AssetTypeHandler from "../Handlers/AssetHandlers/AssetTypeHandler";
import { GetAssetPricesRes } from "../Types/responsetypes";
import Duration from "../utils/DurationHelper/Duration";

var clients: WebSocket[] = [];

const router: Router = Express.Router() as Router;

const requestedCurrencies: Map<string, number> = new Map<string, number>();

router.ws("/", function (ws: WebSocket, req: Express.Request | any, next: any) {
	{
		clients.push(ws);
		var currencyArray = req.body.currencies as string[];
		currencyArray.forEach((cur) => {
			let currentNum: number = requestedCurrencies.get(cur) || 0;
			requestedCurrencies.set(cur, currentNum + 1);
		});
		ws.on("close", function () {
			clients.splice(clients.indexOf(ws), 1);
			currencyArray.forEach((cur) => {
				let currentNum: number = requestedCurrencies.get(cur) || 0;
				if (currentNum <= 1) requestedCurrencies.delete(cur);
				else requestedCurrencies.set(cur, currentNum - 1);
			});
		});
	}
});

export async function startPriceCoroutine() {
	while (true) {
		await new Promise((resolve) => setTimeout(resolve, Duration.Second(3)));
		if (clients.length > 0) {
			let requestedCurrenciesArray = Array.from(requestedCurrencies.keys());
			var result = new GetAssetPricesRes(
				await AssetTypeHandler.GetValuesPerLot(requestedCurrenciesArray)
			);
			clients.forEach((c) => {
				c.send(JSON.stringify(result));
			});
		}
	}
}

export default router;
