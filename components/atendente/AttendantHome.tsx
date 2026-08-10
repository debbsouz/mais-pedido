"use client";

import {
  ClipboardText,
  CurrencyCircleDollar,
  Receipt,
  Table,
} from "@phosphor-icons/react";

import { useOrders } from "@/components/providers/OrdersProvider";
import { useTables } from "@/components/providers/TablesProvider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AttendantHome() {
  const { orders } = useOrders();
  const { tables } = useTables();

  const waitingPaymentTables =
    tables.filter(
      (table) =>
        table.status === "waiting-payment",
    );

  const counterOrders =
    orders.filter(
      (order) =>
        order.fulfillment === "Balcão" ||
        order.fulfillment === "Retirada",
    );

  const waitingOrders =
    counterOrders.filter(
      (order) =>
        order.status === "new" ||
        order.status === "ready",
    );

  const pendingTableTotal =
    waitingPaymentTables.reduce(
      (total, table) =>
        total + (table.total ?? 0),
      0,
    );

  return (
    <main className="attendant-app">
      <header className="attendant-header">
        <div>
          <span>+Pedido</span>
          <strong>Burger House</strong>
        </div>

        <div>
          <strong>Atendimento</strong>
          <span>Caixa / Balcão</span>
        </div>
      </header>

      <section className="attendant-home">
        <div className="attendant-home__heading">
          <div>
            <span>Operação</span>
            <h1>Atendimento</h1>

            <p>
              Acompanhe pedidos de balcão,
              retirada e mesas aguardando
              pagamento.
            </p>
          </div>
        </div>

        <div className="attendant-stats">
          <article>
            <div>
              <ClipboardText
                size={20}
                weight="bold"
              />
            </div>

            <span>Pedidos pendentes</span>

            <strong>
              {waitingOrders.length}
            </strong>
          </article>

          <article>
            <div>
              <Table
                size={20}
                weight="bold"
              />
            </div>

            <span>
              Mesas em fechamento
            </span>

            <strong>
              {waitingPaymentTables.length}
            </strong>
          </article>

          <article>
            <div>
              <CurrencyCircleDollar
                size={20}
                weight="bold"
              />
            </div>

            <span>
              Total aguardando
            </span>

            <strong>
              {formatCurrency(
                pendingTableTotal,
              )}
            </strong>
          </article>
        </div>

        <section className="attendant-section">
          <div className="attendant-section__heading">
            <div>
              <span>
                <Table
                  size={18}
                  weight="bold"
                />
                Fechamentos
              </span>

              <h2>
                Mesas aguardando pagamento
              </h2>
            </div>

            <strong>
              {waitingPaymentTables.length}
            </strong>
          </div>

          {waitingPaymentTables.length >
          0 ? (
            <div className="attendant-table-list">
              {waitingPaymentTables.map(
                (table) => (
                  <article
                    key={table.id}
                    className="attendant-table-payment"
                  >
                    <div className="attendant-table-payment__number">
                      <span>Mesa</span>

                      <strong>
                        {String(
                          table.number,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>
                    </div>

                    <div className="attendant-table-payment__info">
                      <strong>
                        {table.customerName ||
                          "Cliente da mesa"}
                      </strong>

                      <span>
                        {table.people ?? 1}{" "}
                        {(table.people ??
                          1) === 1
                          ? "pessoa"
                          : "pessoas"}
                      </span>
                    </div>

                    <div className="attendant-table-payment__total">
                      <span>
                        Total
                      </span>

                      <strong>
                        {formatCurrency(
                          table.total ??
                            0,
                        )}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="attendant-table-payment__button"
                    >
                      <Receipt
                        size={17}
                        weight="bold"
                      />

                      Receber
                    </button>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="attendant-empty">
              <span>✓</span>

              <strong>
                Nenhuma mesa aguardando
              </strong>

              <p>
                Os fechamentos solicitados
                pelos garçons aparecerão
                aqui.
              </p>
            </div>
          )}
        </section>

        <section className="attendant-section">
          <div className="attendant-section__heading">
            <div>
              <span>
                <ClipboardText
                  size={18}
                  weight="bold"
                />

                Balcão e retirada
              </span>

              <h2>
                Pedidos da operação
              </h2>
            </div>

            <strong>
              {waitingOrders.length}
            </strong>
          </div>

          {waitingOrders.length > 0 ? (
            <div className="attendant-orders">
              {waitingOrders.map(
                (order) => (
                  <article
                    key={order.id}
                    className="attendant-order-card"
                  >
                    <div>
                      <span>
                        Pedido #{order.id}
                      </span>

                      <strong>
                        {order.customer}
                      </strong>

                      <small>
                        {order.fulfillment}
                        {" · "}
                        {order.origin}
                      </small>
                    </div>

                    <div>
                      <span>
                        {order.items}
                      </span>

                      <strong>
                        {order.total}
                      </strong>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="attendant-empty">
              <span>✓</span>

              <strong>
                Nenhum pedido pendente
              </strong>

              <p>
                Pedidos de balcão e retirada
                aparecerão aqui.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}