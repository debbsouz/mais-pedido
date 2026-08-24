"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { OperationHeader } from "@/components/inicio/OperationHeader";
import { OperationOverview } from "@/components/inicio/OperationOverview";
import { RecentOrders } from "@/components/inicio/RecentOrders";
import { useTables } from "@/components/providers/TablesProvider";

export default function InicioPage() {
  const router = useRouter();
  const { tables } = useTables();

  const salonSummary = useMemo(() => {
    return {
      free: tables.filter(
        (table) => table.status === "free",
      ).length,

      occupied: tables.filter(
        (table) =>
          table.status === "occupied",
      ).length,

      waitingPayment: tables.filter(
        (table) =>
          table.status === "waiting-payment",
      ).length,
    };
  }, [tables]);

  return (
    <>
      <OperationHeader />

      <OperationOverview />

      <section className="operation-bottom-grid">
        <RecentOrders />

        <article className="dashboard-card operation-summary">
          <div className="dashboard-card__header">
            <div>
              <h2>Resumo do salão</h2>
              <p>Movimentação das mesas agora</p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/mesas")}
            >
              Ver mesas
            </button>
          </div>

          <div className="operation-summary__content">
            <div>
              <span>Mesas livres</span>
              <strong>
                {salonSummary.free}
              </strong>
            </div>

            <div>
              <span>Mesas ocupadas</span>
              <strong>
                {salonSummary.occupied}
              </strong>
            </div>

            <div>
              <span>Aguardando fechamento</span>
              <strong>
                {
                  salonSummary.waitingPayment
                }
              </strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
