import { WebsocketClient, WsMessage24hrTickerRaw } from "binance";
import { PriceCacher } from "../../../../utils/cacher/cacher";
import Duration from "../../../../utils/DurationHelper/Duration";

import assetPriceEventEmitter from "../../../../Events/AssetPricesRequested";
import AssetTypeHandler from "../../AssetTypeHandler";
import { VAssetType } from "../../../../Types/enums";
import logger from "../../../../utils/Implementation/binancelogger";

var running = false;
var ignore: boolean = false;
var timeoutHandle: NodeJS.Timeout;
var ws: any;

const wsClient = new WebsocketClient(
	{
		api_key: process.env.BINANCE_WEBSOCKET_PUBLIC_KEY,
		api_secret: process.env.BINANCE_WEBSOCKET_PRIVATE_KEY,
	},
	logger
);

const ignoreList = new Set<string>();
ignoreList.add("EUR");
ignoreList.add("GXS");
ignoreList.add("GBP");
ignoreList.add("AUD");

ignoreList.add("BTCDOWN");
ignoreList.add("BTCUP");
ignoreList.add("ETHUP");
ignoreList.add("ETHDOWN");
ignoreList.add("ADAUP");
ignoreList.add("ADADOWN");
ignoreList.add("LINKUP");
ignoreList.add("LINKDOWN");
ignoreList.add("BNBUP");
ignoreList.add("BNBDOWN");
ignoreList.add("BTTC");
ignoreList.add("DOTUP");
ignoreList.add("DOTDOWN");
ignoreList.add("TRXUP");
ignoreList.add("TRXDOWN");
ignoreList.add("XRPUP");
ignoreList.add("XRPDOWN");

async function StartBinanceWebSocket(): Promise<void> {
	running = true;
	ws = wsClient.subscribeAll24hrTickers("spot");
}
export default function ActivateBinanceListener(): void {
	assetPriceEventEmitter.on(assetPriceEventEmitter.RequestedEvent, () => {
		if (!running) {
			StartBinanceWebSocket();
			timeoutHandle = setTimeout(() => {
				wsClient.closeWs(ws);
				running = false;
			}, Duration.Minute(1));
		} else {
			timeoutHandle.refresh();
		}
	});
	wsClient.on("message", async (data) => {
		if (ignore) {
			return;
		}
		ignore = true;
		var relevantData = (data as WsMessage24hrTickerRaw[]).filter(
			// (d) => d.s.endsWith("USDT") && !ignoreList.has(d.s.substring(0, d.s.indexOf("USDT")))
			//IF IT IS NOT BTCUSDT IGNORE IT
			(d) => d.s.endsWith("USDT") && d.s.substring(0, d.s.indexOf("USDT")) !== "BTC"
		);

		var assetsWTickers = relevantData.map((d) => {
			var price = parseFloat(d.c as string);
			return {
				ticker: d.s.substring(0, d.s.indexOf("USDT")),
				price: price,
				previousprice: price - (d.p as number),
			};
		});
		var assetuids = await AssetTypeHandler.GetAssetsByTickers(
			assetsWTickers.map((awt) => awt.ticker),
			VAssetType.Crypto
		);
		assetuids.forEach(async (dbasset, index) => {
			if (dbasset.uid === "") { return;}
			PriceCacher.cacheAssetPrice(
				{
					assetuid: dbasset.uid,
					price: assetsWTickers[index].price,
					previousprice: assetsWTickers[index].previousprice,
				},
				Duration.Second(3)
			);
		});
		setTimeout(() => {
			ignore = false;
		}, Duration.Second(3));
	});
	//TODO : check if the following line is required
	assetPriceEventEmitter.emit(assetPriceEventEmitter.RequestedEvent);
}
/*
{
  "e": "24hrTicker",  // Event type
  "E": 123456789,     // Event time
  "s": "BNBBTC",      // Symbol
  "p": "0.0015",      // Price change
  "P": "250.00",      // Price change percent
  "w": "0.0018",      // Weighted average price
  "x": "0.0009",      // First trade(F)-1 price (first trade before the 24hr rolling window)
  "c": "0.0025",      // Last price
  "Q": "10",          // Last quantity
  "b": "0.0024",      // Best bid price
  "B": "10",          // Best bid quantity
  "a": "0.0026",      // Best ask price
  "A": "100",         // Best ask quantity
  "o": "0.0010",      // Open price
  "h": "0.0025",      // High price
  "l": "0.0010",      // Low price
  "v": "10000",       // Total traded base asset volume
  "q": "18",          // Total traded quote asset volume
  "O": 0,             // Statistics open time
  "C": 86400000,      // Statistics close time
  "F": 0,             // First trade ID
  "L": 18150,         // Last trade Id
  "n": 18151          // Total number of trades
}
*/
