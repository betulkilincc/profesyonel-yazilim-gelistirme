import { Status } from "../base/enums";
import { defineStore } from "pinia";
import { useCoreStore } from "./core";
import { useAuthStore } from "./auth";
import {
  vAddUserConnection,
  vDeleteUserConnection,
  vGetAllConnections,
  vGetUserConnections,
  vUpdateUserConnection,
} from "../vealthAPI/connections";
import {
  DBAsset,
  DBConnection,
  GetAllAssetsOfTypeRes,
  GetAllConnectionsRes,
  GetAllUserConnectionsRes,
  GetAssetPricesRes,
  GetHoldingsRes,
  GetTransactionsForAssetRes,
  VResponse,
} from "../vealthAPI/types";
import { useUserStore } from "./user";
import { vGetAllAssetsOfType, vGetAssetPrices } from "../vealthAPI/assets";
import { VAssetType, VTransactionType } from "../vealthAPI/enums";
import {
  vAddTransaction,
  vDeleteTransaction,
  vGetTransactionsForAsset,
  vUpdateTransaction,
} from "../vealthAPI/transactions";
import { vGetHoldings } from "../vealthAPI/holdings";
import { toHandlers } from "vue";

const developmentBackend = "http://localhost:2000";
const productionBackend = ""; // TODO: Add

const wsDevelopmentBackend = "ws://localhost:2000";
const wsProductionBackend = ""; // TODO: Add

export const useApiStore = defineStore("api", {
  state: () => ({
    allConnections: [] as DBConnection[],
    allAssets: [] as DBAsset[],
    ws: null as WebSocket | null,
  }),
  getters: {
    baseUrl: () =>
      useCoreStore().status === Status.Production
        ? productionBackend
        : developmentBackend,
    wsBaseUrl: () =>
      useCoreStore().status === Status.Production
        ? wsProductionBackend
        : wsDevelopmentBackend,
    authorizationHeader: () => {
      return {
        headers: {
          authorization: "Bearer " + useAuthStore().userAccessToken,
        },
      };
    },
    authorizationToken: () => useAuthStore().userAccessToken,
  },
  actions: {
    // GET ALL ASSETS AND CONNECTIONS
    async fetchAllConnections() {
      let response = {} as VResponse;
      response = await vGetAllConnections();

      if (response.isSuccesful)
        this.allConnections = (
          response.result as GetAllConnectionsRes
        ).connections;
      else throw new Error(response.message as any);
    },

    async fetchAllAssets() {
      let response = {} as VResponse;
      response = await vGetAllAssetsOfType(VAssetType.Crypto); // TODO: Handle other asset types

      if (response.isSuccesful) {
        this.allAssets = (response.result as GetAllAssetsOfTypeRes).assets;
        this.allAssets = this.allAssets.sort(
          (a, b) => b.marketCap - a.marketCap
        );
      } else throw new Error(response.message as any);
    },

    // GET USER CONNECTIONS AND HOLDINGS
    async fetchUserConnections() {
      let response = {} as VResponse;
      response = await vGetUserConnections();

      if (response.isSuccesful) {
        useUserStore().userConnections = (
          response.result as GetAllUserConnectionsRes
        ).userConnections;
      } else throw new Error(response.message as any);
    },

    async fetchHoldings() {
      let response = {} as VResponse;
      response = await vGetHoldings();

      if (response.isSuccesful) {
        this.updateHoldings(response.result as GetHoldingsRes);
      } else throw new Error(response.message as any);
    },

    startWebsocket() {
      if (this.ws) return;

      const wsHoldingsEndpoint = `${this.wsBaseUrl}/holdingsws?authorization=${this.authorizationToken}`;
      this.ws = new WebSocket(wsHoldingsEndpoint);
      this.ws.addEventListener("message", (event: any) =>
        this.updateHoldings(JSON.parse(event.data))
      );
    },

    stopWebsocket() {
      this.ws?.close();
      this.ws = null;
    },

    updateHoldings(holdingsData: GetHoldingsRes) {
      const userStore = useUserStore();
      userStore.holdings = holdingsData.holdings;
      userStore.sortHoldings();
      userStore.totalBalance = holdingsData.totalBalance;
      userStore.previousTotalBalance = holdingsData.previousTotalBalance;
    },

    // GET ASSET PRICES
    async getAssetPrices(assetUids: string[]) {
      let response = {} as VResponse;
      response = await vGetAssetPrices(assetUids); // TODO: Handle other asset types

      if (response.isSuccesful)
        return (response.result as GetAssetPricesRes).assetPrices;
      else throw new Error(response.message as any);
    },

    // CONNECTION MODIFICATIONS
    async addUserConnection(
      connectionUid: string,
      name: string,
      publicKey: string,
      secretKey?: string
    ) {
      let response = {} as VResponse;
      response = await vAddUserConnection(
        connectionUid,
        name,
        publicKey,
        secretKey
      );

      if (!response.isSuccesful) throw new Error(response.message as any);
    },

    async updateUserConnection(
      uid: string,
      newName?: string,
      newPublicKey?: string,
      newSecretKey?: string
    ) {
      let response = {} as VResponse;
      response = await vUpdateUserConnection(
        uid,
        newName,
        newPublicKey,
        newSecretKey
      );

      if (!response.isSuccesful) throw new Error(response.message as any);
    },

    async deleteUserConnection(uid: string) {
      let response = {} as VResponse;
      response = await vDeleteUserConnection(uid);

      if (!response.isSuccesful) throw new Error(response.message as any);
    },

    // TRANSACTION MODIFICATIONS
    async addTransaction(
      type: VTransactionType,
      assetUid: string,
      quantity: number,
      pricePerLot: number
    ) {
      let response = {} as VResponse;
      response = await vAddTransaction(type, assetUid, quantity, pricePerLot);

      if (!response.isSuccesful) throw new Error(response.message as any);
    },

    async getTransactionsForAsset(assetUid: string) {
      let response = {} as VResponse;
      response = await vGetTransactionsForAsset(assetUid);

      if (response.isSuccesful)
        return (response.result as GetTransactionsForAssetRes).transactions;
      else throw new Error(response.message as any);
    },

    async deleteTransaction(transactionUid: string) {
      let response = {} as VResponse;
      response = await vDeleteTransaction(transactionUid);

      if (!response.isSuccesful) throw new Error(response.message as any);
    },

    async updateTransaction(
      transactionUid: string,
      newType?: VTransactionType,
      newQuantity?: number,
      newPricePerLot?: number
    ) {
      let response = {} as VResponse;
      response = await vUpdateTransaction(
        transactionUid,
        newType,
        newQuantity,
        newPricePerLot
      );

      if (!response.isSuccesful) throw new Error(response.message as any);
    },
  },
});
