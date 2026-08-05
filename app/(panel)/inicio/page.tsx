"use client";

import { OperationHeader } from "@/components/inicio/OperationHeader";
import { OperationOverview } from "@/components/inicio/OperationOverview";
import { RecentOrders } from "@/components/inicio/RecentOrders";

export default function InicioPage() {
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

            <button type="button">Ver mesas</button>
          </div>

          <div className="operation-summary__content">
            <div>
              <span>Mesas livres</span>
              <strong>8</strong>
            </div>

            <div>
              <span>Mesas ocupadas</span>
              <strong>4</strong>
            </div>

            <div>
              <span>Aguardando fechamento</span>
              <strong>2</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}