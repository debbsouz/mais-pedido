import { MonthlyReportSection } from "@/components/relatorios/MonthlyReportSection";
import { RelatoriosPanel } from "@/components/relatorios/RelatoriosPanel";
import { getMonthlyReport } from "@/lib/monthly-report-dal";
import { getReportsSummary } from "@/lib/relatorios-dal";

/**
 * Relatorios operacionais reais (produtos mais vendidos, pedidos
 * por status, horarios de pico), ver lib/relatorios-dal.ts, mais o
 * relatorio executivo mensal (lib/monthly-report-dal.ts). Sem
 * pedido no periodo, a tela mostra um estado vazio honesto.
 */
export default async function RelatoriosPage() {
  const [summary, monthlyReport] = await Promise.all([
    getReportsSummary(),
    getMonthlyReport(),
  ]);

  return (
    <>
      <RelatoriosPanel summary={summary} />
      <MonthlyReportSection report={monthlyReport} />
    </>
  );
}
