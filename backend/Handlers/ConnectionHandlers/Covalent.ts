import { DBUserConnection } from "../../Types/DBTypes";
import { requests } from "../../utils/axiosHelper/api";
import { ConnectionService } from "../../Types/HandlerTypes";
import {
  AssetQ,
  ConnectionAssets,
  PartialUserConnection,
} from "../../Types/types";
import AssetTypeHandler from "../AssetHandlers/AssetTypeHandler";
import { VAssetType, VConnectionType } from "../../Types/enums";

export class Covalent implements ConnectionService {
  baseAddress: string = process.env.COVALENT_API_HOST as string;
  apiKey: string = process.env.COVALENT_API_KEY as string;

  getAddress = (publicKey: string, type: VConnectionType): string => {
    return this.baseAddress +
    getChainId(type) +
    "/address/" +
    publicKey +
    "/balances_v2" +
    "/?&key=" +
    this.apiKey;
  }

  async GetAssets(connection: DBUserConnection): Promise<ConnectionAssets> {
    const address = this.getAddress(connection.publicKey,connection.connection.type);
      try
      {
        const response =    (await requests.get(address)) as CovalentResponse;

        response.data.items = 
        response.data.items.filter(item=>validateCoin(item.contract_address,item.contract_ticker_symbol));
    
        let tickers = response.data.items.map(
          (item) => item.contract_ticker_symbol
        );
        let assets = await AssetTypeHandler.GetAssetsByTickers(
          tickers,
          VAssetType.Crypto
        );
        let prices = await AssetTypeHandler.GetValuesPerLot(
          assets.map((asset) => asset.uid)
        );
    
        let result_assets = response.data.items.map((item, index) => {
          let asset = assets[index];
          let assetQ: AssetQ = {
            quantity: item.balance / 10 ** item.contract_decimals,
            price: prices[index].price,
            previousPrice: prices[index].previousprice,
            uid: asset.uid,
            name: asset.name,
            ticker: asset.ticker,
            logoURL: asset.logoURL,
            type: VAssetType.Crypto,
          };
          return assetQ;
        });
        let result: ConnectionAssets = {
          assets: result_assets,
          userConnection: connection,
        };
        return result;
      }
      catch{
        let emptyResult : ConnectionAssets =
        {
          assets: [],
          userConnection: connection,
        }
        return emptyResult;
      }
    
  }

  async VerifyConnection(connection: PartialUserConnection): Promise<boolean> {
    const address = this.getAddress(connection.publicKey,connection.type);
    let result = (await requests.get(address).then(() => true).catch(() => false));
    return result;
  }
}

function getChainId(chain: VConnectionType): number {
  switch (chain) {
    case VConnectionType.EthereumWallet:
      return 1;
      case VConnectionType.AvalancheWallet:
        return 43114;
    default:
      throw new Error("Unknown chain");
  }
}

interface CovalentResponse {
  data: CovalentResponseData;
  error: any;
  error_message: any;
  error_code: number;
}
interface CovalentResponseData {
  items: CovalentResponseItem[];
}
interface CovalentResponseItem {
  contract_decimals: number;
  contract_ticker_symbol: string;
  quote_rate: number;
  balance: number;
  contract_address: string;
}
function validateCoin(address: string, ticker: string) {
  if (
    address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
    ticker === "ETH"
  )
    return false;
  return true;
}
