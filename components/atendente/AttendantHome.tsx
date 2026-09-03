"use client";

import {
  ArrowLeft,
  Check,
  ClipboardText,
  CookingPot,
  CurrencyCircleDollar,
  Package,
  Receipt,
  Table,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

import { formatCurrency } from "@/lib/format";
import type { RestaurantTable } from "@/components/mesas/TableCard";
import type { Order } from "@/components/pedidos/OrderCard";
import {
  OrderPaymentForm,
  type NewOrderPaymentData,
} from "@/components/pedidos/OrderPaymentForm";
import { useCurrentUser } from "@/components/providers/AuthProvider";
import { useOrders } from "@/components/providers/OrdersProvider";
import { useTables } from "@/components/providers/TablesProvider";

const initialPayment: NewOrderPaymentData = {
  method: null,
  cardBrand: null,
  needsCardMachine: false,
  changeFor: "",
  observation: "",
};

function parseMoney(value: string) {
  if (!value) {
    return 0;
  }

  return Number(
    value
      .replace(/\./g, "")
      .replace(",", "."),
  );
}

export function AttendantHome() {
  const currentUser = useCurrentUser();

  const {
    orders,
    moveOrder,
    completeOrder,
  } = useOrders();

  const {
    tables,
    setTables,
  } = useTables();

  const [
    selectedTable,
    setSelectedTable,
  ] = useState<RestaurantTable | null>(
    null,
  );

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<Order | null>(null);

  const [
    payment,
    setPayment,
  ] = useState<NewOrderPaymentData>(
    initialPayment,
  );

  const [
    isPaymentOpen,
    setIsPaymentOpen,
  ] = useState(false);

  const [
    isConfirmingPayment,
    setIsConfirmingPayment,
  ] = useState(false);

  const [
    isOrderConfirmOpen,
    setIsOrderConfirmOpen,
  ] = useState(false);

  const waitingPaymentTables =
    tables.filter(
      (table) =>
        table.status ===
        "waiting-payment",
    );

  const counterOrders =
    orders.filter(
      (order) =>
        order.fulfillment ===
          "Balcão" ||
        order.fulfillment ===
          "Retirada",
    );

  const waitingOrders =
    counterOrders.filter(
      (order) =>
        order.status === "new" ||
        order.status === "ready",
    );

  const preparingOrders =
    counterOrders.filter(
      (order) =>
        order.status ===
        "preparing",
    );

  const pendingTableTotal =
    waitingPaymentTables.reduce(
      (total, table) =>
        total +
        (table.total ?? 0),
      0,
    );

  function openPayment(
    table: RestaurantTable,
  ) {
    setSelectedTable(table);

    setPayment(
      initialPayment,
    );

    setIsConfirmingPayment(
      false,
    );

    setIsPaymentOpen(true);
  }

  function closePayment() {
    setSelectedTable(null);

    setPayment(
      initialPayment,
    );

    setIsConfirmingPayment(
      false,
    );

    setIsPaymentOpen(false);
  }

  function canConfirmPayment() {
    if (
      !selectedTable ||
      !payment.method
    ) {
      return false;
    }

    const isCard =
      payment.method ===
        "Crédito" ||
      payment.method ===
        "Débito";

    if (
      isCard &&
      !payment.cardBrand
    ) {
      return false;
    }

    if (
      payment.method ===
        "Dinheiro" &&
      payment.changeFor
    ) {
      const changeAmount =
        parseMoney(
          payment.changeFor,
        );

      if (
        changeAmount <
        (selectedTable.total ??
          0)
      ) {
        return false;
      }
    }

    return true;
  }

  function requestPaymentConfirmation() {
    if (
      !canConfirmPayment()
    ) {
      return;
    }

    setIsConfirmingPayment(
      true,
    );
  }

  function cancelPaymentConfirmation() {
    setIsConfirmingPayment(
      false,
    );
  }

  function confirmPaymentAndRelease() {
    if (
      !selectedTable ||
      !canConfirmPayment()
    ) {
      return;
    }

    const releasedTable: RestaurantTable =
      {
        id: selectedTable.id,
        number:
          selectedTable.number,
        status: "free",
      };

    setTables(
      (currentTables) =>
        currentTables.map(
          (table) =>
            table.id ===
            selectedTable.id
              ? releasedTable
              : table,
        ),
    );

    closePayment();
  }

  function acceptCounterOrder(
    orderId: string,
  ) {
    moveOrder(
      orderId,
      "preparing",
    );
  }

  function requestOrderDelivery(
    order: Order,
  ) {
    setSelectedOrder(order);
    setIsOrderConfirmOpen(true);
  }

  function closeOrderConfirmation() {
    setSelectedOrder(null);
    setIsOrderConfirmOpen(false);
  }

  function confirmOrderDelivery() {
    if (!selectedOrder) {
      return;
    }

    void completeOrder(
      selectedOrder.id,
    );

    closeOrderConfirmation();
  }

  return (
    <main className="attendant-app">
      <header className="attendant-header">
        <div>
          <span>
            +Pedido
          </span>

          <strong>
            {currentUser.organizationName}
          </strong>
        </div>

        <div>
          <strong>
            Atendimento
          </strong>

          <span>
            Caixa / Balcão
          </span>
        </div>
      </header>

      <section className="attendant-home">
        <div className="attendant-home__heading">
          <div>
            <span>
              Operação
            </span>

            <h1>
              Atendimento
            </h1>

            <p>
              Acompanhe pedidos de
              balcão, retirada e mesas
              aguardando pagamento.
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

            <span>
              Pedidos pendentes
            </span>

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
              {
                waitingPaymentTables.length
              }
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
                Mesas aguardando
                pagamento
              </h2>
            </div>

            <strong>
              {
                waitingPaymentTables.length
              }
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
                      <span>
                        Mesa
                      </span>

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
                        {table.people ??
                          1}{" "}
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
                      onClick={() =>
                        openPayment(
                          table,
                        )
                      }
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
              <span>
                ✓
              </span>

              <strong>
                Nenhuma mesa
                aguardando
              </strong>

              <p>
                Os fechamentos
                solicitados pelos
                garçons aparecerão
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
              {
                counterOrders.length
              }
            </strong>
          </div>

          {counterOrders.length > 0 ? (
            <div className="attendant-orders">
              {counterOrders.map(
                (order) => (
                  <article
                    key={order.id}
                    className={`attendant-order-card attendant-order-card--${order.status}`}
                  >
                    <div className="attendant-order-card__main">
                      <span>
                        Pedido #
                        {order.id}
                      </span>

                      <strong>
                        {
                          order.customer
                        }
                      </strong>

                      <small>
                        {
                          order.fulfillment
                        }
                        {" · "}
                        {order.origin}
                      </small>
                    </div>

                    <div className="attendant-order-card__details">
                      <span>
                        {order.items}
                      </span>

                      <strong>
                        {order.total}
                      </strong>
                    </div>

                    <div className="attendant-order-card__status">
                      {order.status ===
                        "new" && (
                        <span className="attendant-order-status attendant-order-status--new">
                          Novo
                        </span>
                      )}

                      {order.status ===
                        "preparing" && (
                        <span className="attendant-order-status attendant-order-status--preparing">
                          <CookingPot
                            size={15}
                          />

                          Em preparo
                        </span>
                      )}

                      {order.status ===
                        "ready" && (
                        <span className="attendant-order-status attendant-order-status--ready">
                          <Check
                            size={15}
                            weight="bold"
                          />

                          Pronto
                        </span>
                      )}
                    </div>

                    <div className="attendant-order-card__actions">
                      {order.status ===
                        "new" && (
                        <button
                          type="button"
                          className="attendant-order-action attendant-order-action--accept"
                          onClick={() =>
                            acceptCounterOrder(
                              order.id,
                            )
                          }
                        >
                          <Check
                            size={17}
                            weight="bold"
                          />

                          Aceitar
                        </button>
                      )}

                      {order.status ===
                        "preparing" && (
                        <div className="attendant-order-waiting">
                          <CookingPot
                            size={17}
                          />

                          Aguardando
                          cozinha
                        </div>
                      )}

                      {order.status ===
                        "ready" && (
                        <button
                          type="button"
                          className="attendant-order-action attendant-order-action--deliver"
                          onClick={() =>
                            requestOrderDelivery(
                              order,
                            )
                          }
                        >
                          <Package
                            size={17}
                            weight="bold"
                          />

                          Entregar pedido
                        </button>
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="attendant-empty">
              <span>
                ✓
              </span>

              <strong>
                Nenhum pedido
                pendente
              </strong>

              <p>
                Pedidos de balcão e
                retirada aparecerão
                aqui.
              </p>
            </div>
          )}

          {preparingOrders.length >
            0 && (
            <p className="attendant-orders__hint">
              {
                preparingOrders.length
              }{" "}
              {preparingOrders.length ===
              1
                ? "pedido está"
                : "pedidos estão"}{" "}
              sendo preparado
              {preparingOrders.length ===
              1
                ? ""
                : "s"}{" "}
              pela cozinha.
            </p>
          )}
        </section>
      </section>

      {/* PAGAMENTO DA MESA */}

      {isPaymentOpen &&
        selectedTable && (
          <div className="attendant-payment">
            <button
              type="button"
              className="attendant-payment__backdrop"
              onClick={
                closePayment
              }
              aria-label="Fechar pagamento"
            />

            <section className="attendant-payment__panel">
              <header className="attendant-payment__header">
                <div>
                  <span>
                    Fechamento da mesa
                  </span>

                  <h2>
                    Mesa{" "}
                    {String(
                      selectedTable.number,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </h2>

                  <p>
                    Total a receber
                  </p>

                  <strong>
                    {formatCurrency(
                      selectedTable.total ??
                        0,
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={
                    closePayment
                  }
                  aria-label="Fechar"
                >
                  <X
                    size={20}
                    weight="bold"
                  />
                </button>
              </header>

              <div className="attendant-payment__content">
                <OrderPaymentForm
                  fulfillment="Mesa"
                  payment={payment}
                  total={
                    selectedTable.total ??
                    0
                  }
                  onChange={
                    setPayment
                  }
                  allowCommand={
                    false
                  }
                />

                <button
                  type="button"
                  className="attendant-payment__confirm"
                  disabled={
                    !canConfirmPayment()
                  }
                  onClick={
                    requestPaymentConfirmation
                  }
                >
                  <Check
                    size={19}
                    weight="bold"
                  />

                  Confirmar pagamento
                </button>
              </div>
            </section>
          </div>
        )}

      {/* CONFIRMAÇÃO DO PAGAMENTO */}

      {isConfirmingPayment &&
        selectedTable && (
          <div className="attendant-confirm">
            <button
              type="button"
              className="attendant-confirm__backdrop"
              onClick={
                cancelPaymentConfirmation
              }
              aria-label="Cancelar confirmação"
            />

            <section className="attendant-confirm__card">
              <div className="attendant-confirm__icon">
                <Check
                  size={24}
                  weight="bold"
                />
              </div>

              <div className="attendant-confirm__heading">
                <span>
                  Confirmar recebimento
                </span>

                <h3>
                  Pagamento recebido?
                </h3>

                <p>
                  Confirme somente após
                  receber o pagamento.
                  Depois disso, a Mesa{" "}
                  {String(
                    selectedTable.number,
                  ).padStart(
                    2,
                    "0",
                  )}{" "}
                  será liberada para um
                  novo atendimento.
                </p>
              </div>

              <div className="attendant-confirm__summary">
                <div>
                  <span>
                    Forma de pagamento
                  </span>

                  <strong>
                    {payment.method}
                  </strong>
                </div>

                <div>
                  <span>
                    Valor
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedTable.total ??
                        0,
                    )}
                  </strong>
                </div>
              </div>

              <div className="attendant-confirm__actions">
                <button
                  type="button"
                  onClick={
                    cancelPaymentConfirmation
                  }
                >
                  <ArrowLeft
                    size={17}
                    weight="bold"
                  />

                  Voltar
                </button>

                <button
                  type="button"
                  onClick={
                    confirmPaymentAndRelease
                  }
                >
                  <Check
                    size={17}
                    weight="bold"
                  />

                  Confirmar e liberar
                </button>
              </div>
            </section>
          </div>
        )}

      {/* CONFIRMAÇÃO DE ENTREGA */}

      {isOrderConfirmOpen &&
        selectedOrder && (
          <div className="attendant-confirm">
            <button
              type="button"
              className="attendant-confirm__backdrop"
              onClick={
                closeOrderConfirmation
              }
              aria-label="Cancelar entrega"
            />

            <section className="attendant-confirm__card">
              <div className="attendant-confirm__icon">
                <Package
                  size={25}
                  weight="bold"
                />
              </div>

              <div className="attendant-confirm__heading">
                <span>
                  Entrega no balcão
                </span>

                <h3>
                  Pedido entregue?
                </h3>

                <p>
                  Confirme depois que o
                  pedido #
                  {selectedOrder.id} for
                  entregue ao cliente{" "}
                  <strong>
                    {
                      selectedOrder.customer
                    }
                  </strong>
                  .
                </p>
              </div>

              <div className="attendant-confirm__summary">
                <div>
                  <span>
                    Tipo
                  </span>

                  <strong>
                    {
                      selectedOrder.fulfillment
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Total
                  </span>

                  <strong>
                    {
                      selectedOrder.total
                    }
                  </strong>
                </div>
              </div>

              <div className="attendant-confirm__actions">
                <button
                  type="button"
                  onClick={
                    closeOrderConfirmation
                  }
                >
                  <ArrowLeft
                    size={17}
                    weight="bold"
                  />

                  Voltar
                </button>

                <button
                  type="button"
                  onClick={
                    confirmOrderDelivery
                  }
                >
                  <Check
                    size={17}
                    weight="bold"
                  />

                  Confirmar entrega
                </button>
              </div>
            </section>
          </div>
        )}
    </main>
  );
}