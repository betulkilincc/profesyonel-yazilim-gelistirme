import { defineStore } from "pinia";
import { auth } from "../firebase/config";
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getUserToken,
  deleteAccount,
} from "../firebase/auth";
import { onAuthStateChanged, User, sendEmailVerification } from "firebase/auth";
import { vCheckUser, vCreateUser, vDeleteUser } from "../vealthAPI/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthReady: false,
    user: null as User | null,
    userAccessToken: "" as string | null,
  }),
  getters: {},
  actions: {
    async signUp(email: string, password: string) {
      this.user = await signUp(email, password);
      sendEmailVerification(this.user);
    },

    async resendVerificationEmail(email: string, password: string) {
      sendEmailVerification(await signIn(email, password));
    },

    async createUserInVDatabase() {
      if (!this.user) throw new Error("User is not authenticated");

      try {
        await this.setUserAccessToken();
        await vCreateUser();
      } catch (error: any) {
        await deleteAccount(this.user);
        this.user = null;
        this.userAccessToken = null;
        throw new Error(error);
      }
    },

    async signIn(email: string, password: string) {
      this.user = await signIn(email, password);

      if (this.user.emailVerified) {
        let isUserInVDatabase = await vCheckUser(email);
        if (!isUserInVDatabase) await this.createUserInVDatabase();
        await this.setUserAccessToken();
      } else throw new Error("Email is not verified. Please check your email.");
    },

    async signOut() {
      await signOut();
      this.user = null;
      this.userAccessToken = null;
    },

    async resetPassword(email: string) {
      await resetPassword(email);
    },

    async deleteAccount() {
      await vDeleteUser();
      await deleteAccount(this.user as User);
      this.user = null;
      this.userAccessToken = null;
    },

    async setUserAccessToken() {
      this.userAccessToken = await this.getUserToken();
    },

    async getUserToken() {
      if (this.user) {
        return await getUserToken(this.user);
      } else return null;
    },
  },
});

const unsub = onAuthStateChanged(auth, async (user) => {
  useAuthStore().isAuthReady = true;
  useAuthStore().user = user;
  await useAuthStore().setUserAccessToken();
  unsub();
});
