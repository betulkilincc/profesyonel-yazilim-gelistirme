import axios from "axios";
import { useApiStore } from "../stores/api";
import { VAssetType } from "./enums";
import {
  GetAllAssetsOfTypeReqBody,
  GetAssetPricesReqBody,
  VResponse,
} from "./types";

const endpointBaseUrl = "/assets";

export async function vGetAllAssetsOfType(assetType: VAssetType) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/getallassetsoftype";

  const config = apiStore.authorizationHeader;
  const data: GetAllAssetsOfTypeReqBody = {
    assetType: assetType,
  };

  const res = await axios.get(
    endpoint + "?assetType=" + data.assetType,
    config
  );
  return res.data as VResponse;
}

export async function vGetAssetPrices(assetUids: string[]) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/assetprices";

  const config = apiStore.authorizationHeader;
  const data: GetAssetPricesReqBody = {
    assetUids: assetUids,
  };

  const res = await axios.post(endpoint, data, config);
  return res.data as VResponse;
}
