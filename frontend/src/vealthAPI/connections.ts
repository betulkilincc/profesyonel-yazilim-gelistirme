import axios from "axios";
import { useApiStore } from "../stores/api";
import {
  AddUserConnectionReqBody,
  DeleteUserConnectionReqBody,
  UpdateUserConnectionReqBody,
  VResponse,
} from "./types";

const endpointBaseUrl = "/connections";

export async function vGetAllConnections() {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/all";

  const config = apiStore.authorizationHeader;

  const res = await axios.get(endpoint, config);
  return res.data as VResponse;
}

export async function vGetUserConnections() {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl;

  const config = apiStore.authorizationHeader;

  const res = await axios.get(endpoint, config);
  return res.data as VResponse;
}

export async function vAddUserConnection(
  connectionUid: string,
  name: string,
  publicKey: string,
  secretKey?: string
) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/add";

  const config = apiStore.authorizationHeader;
  const data: AddUserConnectionReqBody = {
    connectionUid: connectionUid,
    name: name,
    publicKey: publicKey,
    secretKey: secretKey,
  };

  const res = await axios.post(endpoint, data, config);
  return res.data as VResponse;
}

export async function vUpdateUserConnection(
  uid: string,
  newName?: string,
  newPublicKey?: string,
  newSecretKey?: string
) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl + "/update";

  const config = apiStore.authorizationHeader;
  const data: UpdateUserConnectionReqBody = {
    uid: uid,
    newName: newName,
    newPublicKey: newPublicKey,
    newSecretKey: newSecretKey,
  };

  const res = await axios.put(endpoint, data, config);
  return res.data as VResponse;
}

export async function vDeleteUserConnection(uid: string) {
  const apiStore = useApiStore();
  const endpoint = apiStore.baseUrl + endpointBaseUrl;

  const config = apiStore.authorizationHeader;
  const data: DeleteUserConnectionReqBody = {
    uid: uid,
  };

  const res = await axios.delete(endpoint + "?uid=" + data.uid, config);
  return res.data as VResponse;
}
