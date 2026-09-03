import { redirect } from "next/navigation";

/**
 * "Dashboard" era uma tela 100% mockada (OperationStats/
 * OperationAlert/OperationPanel, sem leitura nenhuma do banco),
 * duplicando o que "Início" já faz de verdade. Removida do menu
 * em 2026-09-02; a rota continua existindo só como redirecionamento,
 * pra não quebrar link/favorito antigo.
 */
export default function DashboardPage() {
  redirect("/inicio");
}
