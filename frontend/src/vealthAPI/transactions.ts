import axios from "axios";
import { useApiStore } from "../stores/api";
import { VTransactionType } from "./enums";
import {
  AddTransactionReqBody,
  DeleteTransactionReqBody,
  GetTransactionsForAssetReqBody,
  UpdateTransactionReqBody,
  VResponse,
} from "./types";

const endpointBaseUrl = "/transactions";

export async function vAddTransaction(
  type: VTransactionType,
  assetUid: string,
  quantity: number,
  pricePerLot: number
) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/addtransaction";

  const config = apiStore.authorizationHeader;
  const data: AddTransactionReqBody = {
    type: type,
    assetuid: assetUid,
    quantity: quantity,
    pricePerLot: pricePerLot,
  };

  const res = await axios.post(endpoint, data, config);
  return res.data as VResponse;
}

export async function vGetTransactionsForAsset(assetUid: string) {
  const apiStore = useApiStore();
  const endpoint =
    apiStore.baseUrl + endpointBaseUrl + "/getTransactionsForAsset";

  const config = apiStore.authorizationHeader;
  const data: GetTransactionsForAssetReqBody = {
    assetuid: assetUid,
  };

  const res = await axios.get(endpoint + "?assetuid=" + data.assetuid, config);
  return res.data as VResponse;
}

export async function vUpdateTransaction(
  transactionUid: string,
  newType?: VTransactionType,
  newQuantity?: number,
  newPricePerLot?: number
) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/update";

  const config = apiStore.authorizationHeader;
  const data: UpdateTransactionReqBody = {
    transactionUid: transactionUid,
    newType: newType,
    newQuantity: newQuantity,
    newPricePerLot: newPricePerLot,
  };

  const res = await axios.put(endpoint, data, config);
  return res.data as VResponse;
}

export async function vDeleteTransaction(transactionUid: string) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl;

  const config = apiStore.authorizationHeader;
  const data: DeleteTransactionReqBody = {
    transactionUid: transactionUid,
  };

  const res = await axios.delete(
    endpoint + "?transactionUid=" + data.transactionUid,
    config
  );
  return res.data as VResponse;
}
