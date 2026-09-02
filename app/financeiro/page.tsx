import { FinanceiroPanel } from "@/components/financeiro/FinanceiroPanel";
import { getFinancialSummary } from "@/lib/financeiro-dal";

/**
 * Resumo financeiro real, sem numero inventado: calculado em
 * lib/financeiro-dal.ts a partir dos pedidos de verdade da
 * organizacao. Sem pedido, os cartoes mostram zero e a tela
 * explica isso — nunca um numero de exemplo.
 */
export default async function FinanceiroPage() {
  const summary = await getFinancialSummary();

  return <FinanceiroPanel summary={summary} />;
}
