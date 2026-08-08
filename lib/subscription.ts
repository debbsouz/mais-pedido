import type { AddonId } from "./addons";
import type { PlanId } from "./plans";

export interface CurrentSubscription {
  planId: PlanId;
  activeAddons: AddonId[];
}

/*
 * TEMPORÁRIO:
 * Depois esses dados virão do banco/Supabase
 * conforme a empresa logada.
 */
export const currentSubscription: CurrentSubscription = {
  planId: "premium",

  activeAddons: [],
};