<script setup lang="ts">
import { computed, ErrorCodes, ref } from "vue";
import { useRouter } from "vue-router";
import { useCoreStore } from "../stores/core";
import { useAuthStore } from "../stores/auth";
import { AuthPersistence, setAuthPersistence } from "../firebase/auth";
import ButtonCTA from "../components/ButtonCTA.vue";

const router = useRouter();
const authStore = useAuthStore();

let email = ref("");
let password = ref("");

enum ErrorType {
  Fail,
  Info,
}

let error = ref("");
let errorType = ref(ErrorType.Fail);
let formattedError = computed(() => {
  // Using https://firebase.google.com/docs/reference/js/auth#autherrorcodes
  let errorCode = error.value;
  let strippedErrorCode = errorCode.substring(
    errorCode.lastIndexOf("(") + 1,
    errorCode.lastIndexOf(")")
  );

  switch (strippedErrorCode) {
    case "captcha-check-failed":
      return "The CAPTCHA check failed. Please try again.";
    case "auth/credential-already-in-use":
      return "These credentials are already in use.";
    case "auth/requires-recent-login":
      return "You need to sign in again after a certain amount of time.";
    case "auth/email-change-needs-verification":
      return "You need to verify your email address before you can sign in.";
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/internal-error":
      return "An internal error occurred. Please try again.";
    case "auth/invalid-user-token":
      return "The token is invalid. Please try again.";
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/wrong-password":
      return "The password is invalid.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    case "auth/user-not-found":
      return "The user was not found.";
    case "auth/user-disabled":
      return "The user has been disabled.";
    case "auth/user-signed-out":
      return "The user has been signed out.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    default:
      return error.value;
  }
});
let loading = ref(false);

enum SignInStatus {
  SignIn = "Sign In",
  SignUp = "Sign Up",
  ForgotPassword = "Forgot Password",
}

let signInStatus = ref(SignInStatus.SignIn);
let checkbox = ref(null);

let headerText = computed(() =>
  signInStatus.value === SignInStatus.SignIn
    ? "Sign In"
    : signInStatus.value === SignInStatus.SignUp
    ? "Sign Up"
    : "Forgot Password"
);

let checkboxText = computed(() =>
  signInStatus.value === SignInStatus.SignIn
    ? "Remember me"
    : "I agree to the Terms and acknowledge the Privacy Notice."
);

let buttonText = computed(() =>
  signInStatus.value === SignInStatus.SignIn
    ? "Sign In"
    : signInStatus.value === SignInStatus.SignUp
    ? "Sign Up"
    : "Reset Password"
);

let footerText = computed(() =>
  signInStatus.value === SignInStatus.SignIn
    ? "Don't have an account?"
    : signInStatus.value === SignInStatus.SignUp
    ? "Already have an account?"
    : "Back to"
);

let footerActionText = computed(() =>
  signInStatus.value === SignInStatus.SignIn
    ? " Sign Up"
    : signInStatus.value === SignInStatus.SignUp
    ? " Sign In"
    : " Sign In"
);

async function signIn() {
  try {
    loading.value = true;
    if ((checkbox as any).value.checked)
      await setAuthPersistence(AuthPersistence.LOCAL);
    else await setAuthPersistence(AuthPersistence.SESSION);

    await authStore.signIn(email.value, password.value);
    await router.push("/app/assets");
    loading.value = false;
  } catch (e: any) {
    errorType.value = ErrorType.Fail;
    error.value = e.message;

    // To avoid internal error issue
    if (email.value)
      password.value === "" ? (error.value = "(auth/wrong-password)") : null;

    loading.value = false;
  }
}

async function signUp() {
  if (checkbox.value && (checkbox as any).value.checked === false) {
    errorType.value = ErrorType.Fail;
    error.value =
      "You must agree to the Terms and acknowledge the Privacy Notice.";
    return;
  }

  try {
    loading.value = true;
    await authStore.signUp(email.value, password.value);
    error.value =
      "We've sent you a verification email with a link. Please click on it to complete your sign up.";
    signInStatus.value = SignInStatus.SignIn;
    errorType.value = ErrorType.Info;
    loading.value = false;
  } catch (e: any) {
    errorType.value = ErrorType.Fail;
    error.value = e.message;
    loading.value = false;
  }
}

async function resendVerificationEmail() {
  await authStore.resendVerificationEmail(email.value, password.value);
  error.value = "We've sent you another verification email.";
  errorType.value = ErrorType.Info;
}

async function forgotPassword() {
  loading.value = true;

  try {
    await authStore.resetPassword(email.value);
    signInStatus.value = SignInStatus.SignIn;
  } catch (e: any) {
    errorType.value = ErrorType.Fail;
    error.value = e.message;
  }

  loading.value = false;
}

function signInAction() {
  if (signInStatus.value === SignInStatus.SignIn) {
    signIn();
  } else if (signInStatus.value === SignInStatus.SignUp) {
    signUp();
  } else {
    forgotPassword();
  }
}

function footerChangeView() {
  if (signInStatus.value === SignInStatus.SignIn) {
    signInStatus.value = SignInStatus.SignUp;
  } else signInStatus.value = SignInStatus.SignIn;

  if (checkbox.value) (checkbox as any).value.checked = false;
  error.value = "";
}

const coreStore = useCoreStore();
</script>

<template>
  <!-- CONTAINERS -->
  <div class="vx-core-top">
    <div>
      <div class="vx-core">
        <!-- LOGO -->
        <div>
          <img class="h-16" :src="coreStore.logoLightPath" alt="Vealth Logo" />
        </div>
        <!-- TITLE -->
        <div class="vx-title">
          <h1 class="vx-header">{{ headerText }}</h1>
        </div>
        <!-- FORM -->
        <div>
          <div class="vx-form-container">
            <label class="vx-paragraph-sb" for="email">Email</label>
            <div class="vx-input-container">
              <input
                v-model="email"
                class="vx-paragraph w-full focus:border-primary-3"
                type="email"
                name="email"
                id="email"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div
            v-if="signInStatus !== SignInStatus.ForgotPassword"
            class="vx-form-container"
          >
            <label class="vx-paragraph-sb" for="email">Password</label>
            <div class="vx-input-container">
              <input
                v-model="password"
                class="vx-paragraph w-full focus:border-primary-3"
                type="password"
                name="password"
                id="password"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div
            v-if="signInStatus !== SignInStatus.ForgotPassword"
            class="flex items-center justify-between"
          >
            <div class="flex items-center">
              <input
                ref="checkbox"
                id="remember-me"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4"
              />
              <label
                for="remember-me"
                class="vx-paragraph ml-2 block text-text-2"
              >
                {{ checkboxText }}
              </label>
            </div>

            <div
              v-if="signInStatus === SignInStatus.SignIn"
              class="vx-paragraph cursor-pointer"
            >
              <a
                @click.prevent="
                  signInStatus = SignInStatus.ForgotPassword;
                  error = '';
                "
                >Forgot your password?</a
              >
            </div>
          </div>
          <div class="mt-6">
            <div
              v-if="error"
              :class="[
                'vx-paragraph mb-2 text-center',
                errorType === ErrorType.Fail
                  ? 'text-secondary-1'
                  : 'text-greenVx',
              ]"
            >
              {{ formattedError }}
            </div>
            <div
              v-if="error === 'Email is not verified. Please check your email.'"
              class="vx-paragraph-sb -mt-2 mb-2 cursor-pointer text-center text-primary-3"
              @click="resendVerificationEmail"
            >
              Resend verification email?
            </div>
            <ButtonCTA :click-action="signInAction" :loading="loading">{{
              buttonText
            }}</ButtonCTA>
          </div>
        </div>

        <!-- SIGN UP/IN TEXT -->
        <div class="vx-sign-up vx-paragraph">
          <p>
            {{ footerText }}
            <a class="hover:cursor-pointer" @click.prevent="footerChangeView()"
              ><b>{{ footerActionText }}</b></a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vx-core-top {
  @apply flex flex-col justify-center sm:min-h-screen;
}

.vx-core {
  @apply m-auto bg-white p-10 shadow-lg sm:max-w-md sm:rounded-4xl sm:px-16 sm:py-16;
}

.vx-title {
  @apply mb-10 text-center;
}

.vx-form-container {
  @apply mb-5;
}

.vx-input-container {
  @apply relative mt-1;
}

.vx-sign-up {
  @apply mt-8 text-center text-text-3;
}

a {
  @apply text-secondary-1 hover:text-secondary-4;
}

label {
  @apply block text-text-2;
}

input {
  @apply block rounded-md border-separator border-opacity-50 bg-card text-text-1 placeholder-text-3 placeholder-opacity-60 shadow-sm focus:ring-0 sm:text-sm;
}

button {
  @apply mt-1 inline-flex w-full justify-center rounded-md bg-secondary-1 py-3 text-white shadow-lg hover:bg-secondary-4 focus:outline-none;
}

img {
  @apply mx-auto mb-10;
}
</style>
