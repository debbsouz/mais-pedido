import type { AddonId } from "./addons";
import { currentSubscription } from "./subscription";
import {
  planHasFeature,
  type FeatureId,
} from "./plans";

export function hasFeature(
  feature: FeatureId,
) {
  return planHasFeature(
    currentSubscription.planId,
    feature,
  );
}

export function hasAddon(
  addonId: AddonId,
) {
  return currentSubscription.activeAddons.includes(
    addonId,
  );
}