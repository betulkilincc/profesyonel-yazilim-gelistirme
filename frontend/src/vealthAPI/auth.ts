import axios from "axios";
import { useApiStore } from "../stores/api";
import { CheckUserReqBody } from "./types";

const endpointBaseUrl = "/users";

export async function vCreateUser() {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/createuser";
  const config = apiStore.authorizationHeader;

  const res = await axios.post(endpoint, undefined, config);
  return res.data;
}

export async function vDeleteUser() {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl;
  const config = apiStore.authorizationHeader;

  const res = await axios.delete(endpoint, config);
  return res.data;
}

export async function vCheckUser(email: string) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/checkuser";
  const config = apiStore.authorizationHeader;
  const data: CheckUserReqBody = {
    email: email,
  };

  const res = await axios.post(endpoint, data, config);
  return res.data;
}
