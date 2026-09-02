import { RelatoriosPanel } from "@/components/relatorios/RelatoriosPanel";
import { getReportsSummary } from "@/lib/relatorios-dal";

/**
 * Relatorios operacionais reais (produtos mais vendidos, pedidos
 * por status, horarios de pico), ver lib/relatorios-dal.ts. Sem
 * pedido no periodo, a tela mostra um estado vazio honesto.
 */
export default async function RelatoriosPage() {
  const summary = await getReportsSummary();

  return <RelatoriosPanel summary={summary} />;
}
