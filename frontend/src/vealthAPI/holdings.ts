import axios from "axios";
import { useApiStore } from "../stores/api";
import { VResponse } from "./types";

const endpointBaseUrl = "/holdings";

export async function vGetHoldings() {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl;

  const config = apiStore.authorizationHeader;

  const res = await axios.get(endpoint, config);
  return res.data as VResponse;
}
