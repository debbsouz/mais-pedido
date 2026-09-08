"use client";

import {
  ArrowLeft,
  Check,
  CookingPot,
  Plus,
  Trash,
} from "@phosphor-icons/react";

import { useState } from "react";

import { formatCurrency } from "@/lib/format";
import {
  OrderItemsForm,
  type NewOrderItem,
} from "@/components/pedidos/OrderItemsForm";

import {
  OrderPaymentForm,
  type NewOrderPaymentData,
} from "@/components/pedidos/OrderPaymentForm";

import type { Order } from "@/components/pedidos/OrderCard";

import { useCurrentUser } from "@/components/providers/AuthProvider";
import { useOrders } from "@/components/providers/OrdersProvider";
import { useTables } from "@/components/providers/TablesProvider";

import {
  TableCard,
  type RestaurantTable,
} from "./TableCard";

const initialPayment: NewOrderPaymentData = {
  method: null,
  cardBrand: null,
  needsCardMachine: false,
  changeFor: "",
  observation: "",
};

function calculateItemsTotal(
  items: NewOrderItem[],
) {
  return items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  );
}

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

export function TablesBoard() {
  const currentUser = useCurrentUser();
  const { addOrder } = useOrders();

  const {
    tables,
    openTable: commitOpenTable,
    mergeTableRound,
    requestTableClosing,
    cancelTableClosing,
    releaseTable,
    addTable,
    removeTable,
  } = useTables();

  const canManageLayout =
    currentUser.role === "owner" ||
    currentUser.role === "manager";

  const [selectedTable, setSelectedTable] =
    useState<RestaurantTable | null>(null);

  const [customerName, setCustomerName] =
    useState("");

  const [people, setPeople] =
    useState("1");

  const [isAddingItems, setIsAddingItems] =
    useState(false);

  const [newItems, setNewItems] =
    useState<NewOrderItem[]>([]);

  const [isClosingTable, setIsClosingTable] =
    useState(false);

  const [payment, setPayment] =
    useState<NewOrderPaymentData>(
      initialPayment,
    );

  const occupiedTables = tables.filter(
    (table) => table.status !== "free",
  ).length;

  function handleOpenTable(
    table: RestaurantTable,
  ) {
    setSelectedTable(table);

    setCustomerName(
      table.customerName ?? "",
    );

    setPeople(
      String(table.people ?? 1),
    );

    setIsAddingItems(false);
    setNewItems([]);

    setIsClosingTable(false);
    setPayment(initialPayment);
  }

  function closePreview() {
    setSelectedTable(null);
    setCustomerName("");
    setPeople("1");

    setIsAddingItems(false);
    setNewItems([]);

    setIsClosingTable(false);
    setPayment(initialPayment);
  }

  async function openTable() {
    if (!selectedTable) {
      return;
    }

    const peopleNumber = Number(people);

    if (
      !Number.isInteger(peopleNumber) ||
      peopleNumber < 1
    ) {
      return;
    }

    const updatedTable = await commitOpenTable(
      selectedTable.id,
      customerName,
      peopleNumber,
    );

    if (updatedTable) {
      setSelectedTable(updatedTable);
    }
  }

  function startAddingItems() {
    setNewItems([]);
    setIsAddingItems(true);
    setIsClosingTable(false);
  }

  function cancelAddingItems() {
    setNewItems([]);
    setIsAddingItems(false);
  }

  async function sendItemsToKitchen() {
    if (
      !selectedTable ||
      newItems.length === 0
    ) {
      return;
    }

    const roundTotal =
      calculateItemsTotal(newItems);

    const orderId = Date.now()
      .toString()
      .slice(-6);

    const tableLabel = `Mesa ${String(
      selectedTable.number,
    ).padStart(2, "0")}`;

    const itemsDescription = newItems
      .map(
        (item) =>
          `${item.quantity}x ${item.name}`,
      )
      .join(", ");

    const kitchenOrder: Order = {
      id: orderId,

      number: 0,

      customer: tableLabel,

      origin: "Garçom",

      fulfillment: "Mesa",

      time: "agora",

      createdAt: Date.now(),

      total: formatCurrency(roundTotal),

      items: itemsDescription,

      status: "preparing",

      delayed: false,

      tableNumber: String(
        selectedTable.number,
      ),

      itemDetails: newItems.map(
        (item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }),
      ),
    };

    const realOrderId = await addOrder(kitchenOrder);

    if (!realOrderId) {
      return;
    }

    const updatedTable = mergeTableRound(
      selectedTable.id,
      newItems,
    );

    if (updatedTable) {
      setSelectedTable(updatedTable);
    }

    setNewItems([]);
    setIsAddingItems(false);
  }

  async function startPayment() {
    if (!selectedTable) {
      return;
    }

    const updatedTable = await requestTableClosing(
      selectedTable.id,
    );

    if (!updatedTable) {
      return;
    }

    setSelectedTable(updatedTable);

    setPayment(initialPayment);
    setIsAddingItems(false);
    setIsClosingTable(true);
  }

  async function cancelPayment() {
    if (!selectedTable) {
      return;
    }

    const updatedTable = await cancelTableClosing(
      selectedTable.id,
    );

    if (!updatedTable) {
      return;
    }

    setSelectedTable(updatedTable);

    setPayment(initialPayment);
    setIsClosingTable(false);
  }

  function canConfirmPayment() {
    if (!payment.method) {
      return false;
    }

    const isCard =
      payment.method === "Crédito" ||
      payment.method === "Débito";

    if (
      isCard &&
      !payment.cardBrand
    ) {
      return false;
    }

    if (
      payment.method === "Dinheiro" &&
      payment.changeFor
    ) {
      const changeAmount =
        parseMoney(payment.changeFor);

      if (
        changeAmount <
        (selectedTable?.total ?? 0)
      ) {
        return false;
      }
    }

    return true;
  }

  async function confirmPaymentAndRelease() {
    if (
      !selectedTable ||
      !canConfirmPayment()
    ) {
      return;
    }

    const shouldConfirm =
      window.confirm(
        `Confirmar o pagamento de ${formatCurrency(
          selectedTable.total ?? 0,
        )} e liberar a Mesa ${String(
          selectedTable.number,
        ).padStart(2, "0")}?`,
      );

    if (!shouldConfirm) {
      return;
    }

    const released = await releaseTable(
      selectedTable.id,
    );

    if (!released) {
      return;
    }

    closePreview();
  }

  async function handleAddTable() {
    await addTable();
  }

  async function handleRemoveTable() {
    if (!selectedTable) {
      return;
    }

    const shouldConfirm = window.confirm(
      `Remover a Mesa ${String(
        selectedTable.number,
      ).padStart(2, "0")} do salão?`,
    );

    if (!shouldConfirm) {
      return;
    }

    const removed = await removeTable(
      selectedTable.id,
    );

    if (removed) {
      closePreview();
    }
  }

  return (
    <section className="tables-board">
      <div className="tables-board__summary">
        <div>
          <span>Mesas ocupadas</span>

          <strong>
            {occupiedTables}/{tables.length}
          </strong>
        </div>

        <p>
          Selecione uma mesa para abrir ou
          visualizar a comanda.
        </p>

        {canManageLayout && (
          <button
            type="button"
            className="tables-board__add-table"
            onClick={handleAddTable}
          >
            <Plus size={16} weight="bold" />
            Adicionar mesa
          </button>
        )}
      </div>

      <div className="tables-board__grid">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onOpen={handleOpenTable}
          />
        ))}
      </div>

      {selectedTable && (
        <div className="table-preview">
          <button
            type="button"
            className="table-preview__backdrop"
            onClick={closePreview}
            aria-label="Fechar mesa"
          />

          <aside className="table-preview__panel">
            <header className="table-preview__header">
              <div>
                <span>Mesa</span>

                <h2>
                  {String(
                    selectedTable.number,
                  ).padStart(2, "0")}
                </h2>
              </div>

              <button
                type="button"
                onClick={closePreview}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            {selectedTable.status ===
              "free" && (
              <div className="table-preview__content">
                <div className="table-preview__intro">
                  <span>
                    Novo atendimento
                  </span>

                  <h3>Abrir mesa</h3>

                  <p>
                    Identifique a mesa antes
                    de começar a lançar os
                    pedidos.
                  </p>
                </div>

                <label className="table-preview__field">
                  <span>
                    Nome do cliente
                    <small>
                      {" "}
                      Opcional
                    </small>
                  </span>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Carlos"
                  />
                </label>

                <label className="table-preview__field">
                  <span>
                    Quantidade de pessoas
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={people}
                    onChange={(event) =>
                      setPeople(
                        event.target.value
                          .replace(
                            /\D/g,
                            "",
                          )
                          .slice(0, 2),
                      )
                    }
                  />
                </label>

                <div className="table-preview__notice">
                  Depois de abrir a mesa,
                  você poderá adicionar itens
                  e enviar pedidos para a
                  cozinha.
                </div>

                <button
                  type="button"
                  className="table-preview__primary"
                  onClick={openTable}
                >
                  Abrir atendimento
                </button>

                {canManageLayout && (
                  <button
                    type="button"
                    className="table-preview__remove-table"
                    onClick={handleRemoveTable}
                  >
                    <Trash size={16} weight="bold" />
                    Remover esta mesa do salão
                  </button>
                )}
              </div>
            )}

            {selectedTable.status !==
              "free" &&
              isAddingItems && (
                <div className="table-preview__content table-preview__content--products">
                  <button
                    type="button"
                    className="table-preview__back-products"
                    onClick={
                      cancelAddingItems
                    }
                  >
                    <ArrowLeft
                      size={16}
                      weight="bold"
                    />

                    Voltar para comanda
                  </button>

                  <OrderItemsForm
                    items={newItems}
                    onChange={setNewItems}
                  />

                  <div className="table-preview__send-order">
                    <div>
                      <span>
                        Nova rodada
                      </span>

                      <strong>
                        {formatCurrency(
                          calculateItemsTotal(
                            newItems,
                          ),
                        )}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={
                        sendItemsToKitchen
                      }
                      disabled={
                        newItems.length === 0
                      }
                    >
                      <CookingPot
                        size={18}
                        weight="bold"
                      />

                      Enviar para cozinha
                    </button>
                  </div>
                </div>
              )}

            {selectedTable.status !==
              "free" &&
              isClosingTable && (
                <div className="table-preview__content table-preview__content--payment">
                  <button
                    type="button"
                    className="table-preview__back-products"
                    onClick={cancelPayment}
                  >
                    <ArrowLeft
                      size={16}
                      weight="bold"
                    />

                    Voltar para comanda
                  </button>

                  <div className="table-preview__payment-heading">
                    <span>
                      Fechamento da mesa
                    </span>

                    <h3>
                      Receber{" "}
                      {formatCurrency(
                        selectedTable.total ??
                          0,
                      )}
                    </h3>

                    <p>
                      Escolha a forma de
                      pagamento utilizada pelo
                      cliente.
                    </p>
                  </div>

                  <OrderPaymentForm
                    fulfillment="Mesa"
                    payment={payment}
                    total={
                      selectedTable.total ??
                      0
                    }
                    onChange={setPayment}
                    allowCommand={false}
                  />

                  <button
                    type="button"
                    className="table-preview__confirm-payment"
                    onClick={
                      confirmPaymentAndRelease
                    }
                    disabled={
                      !canConfirmPayment()
                    }
                  >
                    <Check
                      size={18}
                      weight="bold"
                    />

                    Confirmar pagamento e
                    liberar mesa
                  </button>
                </div>
              )}

            {selectedTable.status !==
              "free" &&
              !isAddingItems &&
              !isClosingTable && (
                <div className="table-preview__content">
                  <div className="table-preview__customer">
                    <span>
                      Atendimento atual
                    </span>

                    <h3>
                      {selectedTable.customerName ||
                        `Mesa ${String(
                          selectedTable.number,
                        ).padStart(2, "0")}`}
                    </h3>

                    <p>
                      {selectedTable.people ??
                        1}{" "}

                      {(selectedTable.people ??
                        1) === 1
                        ? "pessoa"
                        : "pessoas"}

                      {" · "}

                      {selectedTable.openedAt}
                    </p>
                  </div>

                  <section className="table-preview__command">
                    <div className="table-preview__section-title">
                      <span>Comanda</span>

                      <strong>
                        {formatCurrency(
                          selectedTable.total ??
                            0,
                        )}
                      </strong>
                    </div>

                    {selectedTable
                      .commandItems?.length ? (
                      <div className="table-preview__command-list">
                        {selectedTable.commandItems.map(
                          (item) => (
                            <div
                              key={
                                item.productId
                              }
                            >
                              <span>
                                {
                                  item.quantity
                                }
                                x {item.name}
                              </span>

                              <strong>
                                {formatCurrency(
                                  item.price *
                                    item.quantity,
                                )}
                              </strong>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="table-preview__empty-command">
                        <span>
                          Comanda vazia
                        </span>

                        <p>
                          Adicione o primeiro
                          pedido da mesa.
                        </p>
                      </div>
                    )}

                    {selectedTable.status ===
                      "occupied" && (
                      <button
                        type="button"
                        className="table-preview__add-items"
                        onClick={
                          startAddingItems
                        }
                      >
                        <Plus
                          size={16}
                          weight="bold"
                        />

                        Adicionar itens
                      </button>
                    )}
                  </section>

                  {selectedTable.status ===
                  "occupied" ? (
                    <button
                      type="button"
                      className="table-preview__primary"
                      onClick={startPayment}
                      disabled={
                        (selectedTable.total ??
                          0) <= 0
                      }
                    >
                      Solicitar fechamento
                    </button>
                  ) : (
                    <>
                      <div className="table-preview__payment-status">
                        <Check
                          size={15}
                          weight="bold"
                        />

                        Aguardando pagamento
                      </div>

                      <button
                        type="button"
                        className="table-preview__primary"
                        onClick={() => {
                          setPayment(
                            initialPayment,
                          );

                          setIsClosingTable(
                            true,
                          );
                        }}
                      >
                        Ir para pagamento
                      </button>
                    </>
                  )}
                </div>
              )}
          </aside>
        </div>
      )}
    </section>
  );
}