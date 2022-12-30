import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User,
  browserSessionPersistence,
  browserLocalPersistence,
  deleteUser,
} from "firebase/auth";
import { auth } from "./config";

enum AuthPersistence {
  LOCAL = "local",
  SESSION = "session",
}

async function setAuthPersistence(persistence: AuthPersistence) {
  return await auth.setPersistence(
    persistence === AuthPersistence.SESSION
      ? browserSessionPersistence
      : browserLocalPersistence
  );
}

async function signUp(email: string, password: string) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  if (res) {
    return res.user;
  } else {
    throw new Error("Could not complete sign up");
  }
}

async function signIn(email: string, password: string) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  if (res) {
    return res.user;
  } else {
    throw new Error("Could not complete sign in");
  }
}

async function signOut() {
  await auth.signOut();
}

async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

async function deleteAccount(user: User) {
  if (user) {
    await deleteUser(user);
  } else {
    throw new Error("No user given or user is not authenticated");
  }
}

async function getUserToken(user: User) {
  if (user) {
    return await user.getIdToken();
  } else {
    throw new Error("No user given");
  }
}

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  deleteAccount,
  getUserToken,
  getCurrentUser,
  setAuthPersistence,
  AuthPersistence,
};
