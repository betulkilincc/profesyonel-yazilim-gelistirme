import express from "express";
import expressWs from "express-ws";

import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

//firebase
import { initializeApp, cert } from "firebase-admin/app";
initializeApp({
	credential: cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PK,
	}),
	databaseURL: "https://Vealth.firebaseio.com",
});

const app = express();
const ws = expressWs(app);

import usersModule from "../routes/users";
import transactionsModule from "../routes/transactions";
import assetsModule from "../routes/assets";
import holdingsModule from "../routes/holdings";
import connectionsModule from "../routes/connections";

import cors from "cors";
import decodeIDToken from "../utils/Authentication/decodeIdToken";
import UrlToBodyParameters from "../utils/UrlToBody/UrlToBodyHelper";
import ActivateBinanceListener from "../Handlers/AssetHandlers/CryptoHandlers/Binance/Binance";

import priceWsModule, { startPriceCoroutine } from "../WebSockets/AssetPrices";
import holdingsWsModlue, { startHoldingsCoroutine } from "../WebSockets/Holdings";

ws.app.use(cors());
ws.app.use(express.json());
ws.app.use(express.urlencoded({ extended: false }));
ws.app.use(cookieParser());
ws.app.use(express.static(path.join(__dirname, "public")));

ws.app.use(UrlToBodyParameters);
app.use(decodeIDToken);

//web sockets
ws.app.use("/pricews", priceWsModule);
startPriceCoroutine();
ws.app.use("/holdingsws", holdingsWsModlue);
startHoldingsCoroutine();

//routes
app.use("/users", usersModule);
app.use("/assets", assetsModule);
app.use("/transactions", transactionsModule);
app.use("/holdings", holdingsModule);
app.use("/connections", connectionsModule);

const port = process.env.PORT || 2000;

ActivateBinanceListener();

app.listen(port, () => {
	if (app.settings.env === "development") {
		console.log(`Server started at http://localhost:${port}`);
	}
});

export default app;
