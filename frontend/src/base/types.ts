import { RenderFunction, Ref } from "vue";

export interface Route {
  path: string;
  name: string;
  isPrimary: boolean;
  component: any;
  icon?: RenderFunction;
  current?: Ref<boolean>;
  meta?: { requiresAuth: boolean };
  children?: Route[];
  redirect?: string;
}
