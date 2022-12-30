import events from "events"

class AssetPricesRequested extends events.EventEmitter {
  constructor() {super();}
  RequestedEvent : string = "AssetPricesRequested";
}
const  assetPriceEventEmitter = new AssetPricesRequested();

export default assetPriceEventEmitter;

