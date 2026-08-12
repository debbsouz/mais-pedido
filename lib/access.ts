import type { AddonId } from "./addons";
import type { CurrentSubscriptionData } from "@/lib/dal";
import {
  planHasFeature,
  type FeatureId,
} from "./plans";

/**
 * Verifica se um plano possui uma feature.
 * Aceita o planId diretamente para usar dados reais da sessao.
 */
export function hasFeature(
  planId: CurrentSubscriptionData["planId"],
  feature: FeatureId,
) {
  return planHasFeature(planId, feature);
}

/**
 * Verifica se a assinatura possui um addon ativo.
 * Aceita os addons diretamente para usar dados reais da sessao.
 */
export function hasAddon(
  activeAddons: CurrentSubscriptionData["activeAddons"],
  addonId: AddonId,
) {
  return activeAddons.includes(addonId);
}