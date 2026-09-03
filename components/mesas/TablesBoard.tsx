"use client";

import {
  ArrowLeft,
  Check,
  CookingPot,
  Plus,
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

function mergeCommandItems(
  currentItems: NewOrderItem[],
  newItems: NewOrderItem[],
) {
  const mergedItems = [...currentItems];

  newItems.forEach((newItem) => {
    const existingItemIndex =
      mergedItems.findIndex(
        (item) =>
          item.productId ===
          newItem.productId,
      );

    if (existingItemIndex >= 0) {
      mergedItems[existingItemIndex] = {
        ...mergedItems[existingItemIndex],

        quantity:
          mergedItems[existingItemIndex]
            .quantity +
          newItem.quantity,
      };

      return;
    }

    mergedItems.push(newItem);
  });

  return mergedItems;
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
  const { addOrder } = useOrders();

  const { tables, setTables } =
    useTables();

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

  function openTable() {
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

    const updatedTable: RestaurantTable = {
      ...selectedTable,

      status: "occupied",

      customerName:
        customerName.trim() ||
        undefined,

      people: peopleNumber,

      total: 0,

      openedAt: "agora",

      commandItems: [],
    };

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === selectedTable.id
          ? updatedTable
          : table,
      ),
    );

    setSelectedTable(updatedTable);
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

  function sendItemsToKitchen() {
    if (
      !selectedTable ||
      newItems.length === 0
    ) {
      return;
    }

    const roundTotal =
      calculateItemsTotal(newItems);

    const currentCommand =
      selectedTable.commandItems ?? [];

    const updatedCommand =
      mergeCommandItems(
        currentCommand,
        newItems,
      );

    const updatedTotal =
      (selectedTable.total ?? 0) +
      roundTotal;

    const updatedTable: RestaurantTable = {
      ...selectedTable,

      status: "occupied",

      commandItems: updatedCommand,

      total: updatedTotal,
    };

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === selectedTable.id
          ? updatedTable
          : table,
      ),
    );

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

    addOrder(kitchenOrder);

    setSelectedTable(updatedTable);

    setNewItems([]);
    setIsAddingItems(false);
  }

  function startPayment() {
    if (!selectedTable) {
      return;
    }

    const updatedTable: RestaurantTable = {
      ...selectedTable,
      status: "waiting-payment",
    };

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === selectedTable.id
          ? updatedTable
          : table,
      ),
    );

    setSelectedTable(updatedTable);

    setPayment(initialPayment);
    setIsAddingItems(false);
    setIsClosingTable(true);
  }

  function cancelPayment() {
    if (!selectedTable) {
      return;
    }

    const updatedTable: RestaurantTable = {
      ...selectedTable,
      status: "occupied",
    };

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === selectedTable.id
          ? updatedTable
          : table,
      ),
    );

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

  function confirmPaymentAndRelease() {
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

    const releasedTable: RestaurantTable = {
      id: selectedTable.id,
      number: selectedTable.number,
      status: "free",
    };

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === selectedTable.id
          ? releasedTable
          : table,
      ),
    );

    closePreview();
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