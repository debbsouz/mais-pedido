import Link from "next/link";

import { LockKey } from "@phosphor-icons/react/dist/ssr";

import {
  minPlanForFeature,
  type FeatureId,
} from "@/lib/plans";

interface PlanLockedNoticeProps {
  feature: FeatureId;
}

/**
 * Substitui um formulário de configurações quando o plano atual
 * não inclui a feature — mesmo espírito do bloqueio "Upgrade" da
 * barra lateral, mas pro conteúdo dentro da página.
 */
export function PlanLockedNotice({
  feature,
}: PlanLockedNoticeProps) {
  const requiredPlan = minPlanForFeature(feature);

  return (
    <div className="settings-card settings-locked">
      <LockKey size={22} weight="bold" />

      <p>
        {requiredPlan
          ? `Disponível a partir do plano ${requiredPlan.name}.`
          : "Não disponível no seu plano atual."}
      </p>

      <Link
        href="/configuracoes/plano"
        className="settings-locked__link"
      >
        Ver planos
      </Link>
    </div>
  );
}
