import { AssetPrice, PriceHandler } from "../../../Types/HandlerTypes";
import { CryptoRank } from "./CryptoRank/Cryptorank";
import {
  CryptoHandlerScore,
  CryptoHandlerScoreProvider,
} from "./Utils/CryptoHandlerScoreProvider";
import { CryptoUidConverter } from "./Utils/CryptoUidConverter";

export class CryptoHandler implements PriceHandler {
  
  static Register(
    name: string,
    handler: PriceHandler,
    converter: (
      originaluid: string,
      providerName: string
    ) => string | undefined,
    handlerScore: CryptoHandlerScore
  ) {
    this.providers.push({
      name,
      handler,
      converter,
      handlerScore,
    } as providerWithData);
  }
  static providers: providerWithData[] = [];
  async GetValuesPerLot(assetUids: string[]): Promise<AssetPrice[]> {
    var ProviderUidList: Map<string, string[]> = new Map();
    await Promise.all(
      assetUids.map(async (assetUid) => {
        return Promise.all(CryptoHandler.providers.map(addOveralScore))
          .then(async (providers) => providers.reduce(getHighestScored))
          .then(
            async (providerWithOveralScore) => providerWithOveralScore.provider
          )
          .then(async (provider) => {
            var provUidList = ProviderUidList.get(provider.name);
            if (!provUidList) provUidList = [];
            provUidList.push(assetUid);
            ProviderUidList.set(provider.name, provUidList);
          });
      })
    );
    //TODO: Logic for reducing the number of providers
    //TODO: backup calls
    var results = await Promise.all(
      CryptoHandler.providers.map(async (provider) => {
        var uidList = ProviderUidList.get(provider.name);
        if (uidList) {
          var reverseMap = new Map<string, string>(
            uidList.map((uid) => [provider.converter(uid), uid])
          );
          var prices = await provider.handler.GetValuesPerLot(
            Array.from(reverseMap.keys())
          );
          prices.forEach((value, index, array) => {
            array[index].assetuid = reverseMap.get(
              value.assetuid.toString()
            ) as string;
          });
          return prices;
        } else return [];
      })
    );
    var result = results.flat();
    return result;
  }
}
function getHighestScored(
  prev: providerOveralScore,
  cur: providerOveralScore
): providerOveralScore {
  return prev.overalScore > cur.overalScore ? prev : cur;
}
async function addOveralScore(
  prov: providerWithData
): Promise<providerOveralScore> {
  var x = { overalScore: 1, provider: prov } as providerOveralScore;
  return x;
}

interface providerOveralScore {
  overalScore: number;
  provider: providerWithData;
}
interface providerWithData {
  name: string;
  handler: PriceHandler;
  converter(originaluid: string): string;
  handlerScore: CryptoHandlerScore;
}

CryptoHandler.Register(
  "cryptorank",
  new CryptoRank(),
  CryptoUidConverter.GetConverter("cryptorank"),
  CryptoHandlerScoreProvider.HandlerScores.get("cryptorank") as CryptoHandlerScore
);
/**
 * The key of the map is how is it stored in the database hence CryptoRank
 * The value is how it might be recognized by Binance or other providers
 * Keep in mind that both the key and the value are being cached
 */
export const exceptionalTickers = new Map<string, string>();
exceptionalTickers.set("LEV", "LEVER");
  