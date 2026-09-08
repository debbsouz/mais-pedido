"use client";

import {
  ArrowLeft,
  CookingPot,
  Plus,
} from "@phosphor-icons/react";
import { useState } from "react";

import { formatCurrency } from "@/lib/format";
import type { RestaurantTable } from "@/components/mesas/TableCard";
import type { NewOrderItem } from "@/components/pedidos/OrderItemsForm";
import type { Order } from "@/components/pedidos/OrderCard";
import { useOrders } from "@/components/providers/OrdersProvider";
import { useTables } from "@/components/providers/TablesProvider";

import { WaiterHeader } from "./WaiterHeader";
import { WaiterOrderForm } from "./WaiterOrderForm";
import { WaiterTableCard } from "./WaiterTableCard";
import {
  WaiterTableFilters,
  type WaiterTableFilter,
} from "./WaiterTableFilters";

function calculateItemsTotal(
  items: NewOrderItem[],
) {
  return items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  );
}

export function WaiterHome() {
  const { addOrder } = useOrders();

  const {
    tables,
    openTable: commitOpenTable,
    mergeTableRound,
    requestTableClosing,
  } = useTables();

  const [selectedTable, setSelectedTable] =
    useState<RestaurantTable | null>(null);

  const [isOpeningTable, setIsOpeningTable] =
    useState(false);

  const [isAddingItems, setIsAddingItems] =
    useState(false);

  const [
    isClosingConfirmOpen,
    setIsClosingConfirmOpen,
  ] = useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [people, setPeople] =
    useState("1");

  const [newItems, setNewItems] =
    useState<NewOrderItem[]>([]);

  const [
    roundObservation,
    setRoundObservation,
  ] = useState("");

  const [
    activeTableFilter,
    setActiveTableFilter,
  ] =
    useState<WaiterTableFilter>("all");

  const [
    tableSearchTerm,
    setTableSearchTerm,
  ] = useState("");

  const occupiedCount =
    tables.filter(
      (table) =>
        table.status !== "free",
    ).length;

  const filteredTables =
    tables.filter((table) => {
      const matchesFilter =
        activeTableFilter === "all" ||
        table.status ===
          activeTableFilter;

      const normalizedSearch =
        tableSearchTerm
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return matchesFilter;
      }

      const tableNumber =
        String(table.number).padStart(
          2,
          "0",
        );

      const matchesSearch =
        tableNumber.includes(
          normalizedSearch,
        ) ||
        `mesa ${tableNumber}`.includes(
          normalizedSearch,
        ) ||
        table.customerName
          ?.toLowerCase()
          .includes(
            normalizedSearch,
          );

      return (
        matchesFilter &&
        Boolean(matchesSearch)
      );
    });

  function openTablePreview(
    table: RestaurantTable,
  ) {
    setSelectedTable(table);

    setCustomerName(
      table.customerName ?? "",
    );

    setPeople(
      String(table.people ?? 1),
    );

    setIsOpeningTable(false);
    setIsAddingItems(false);
    setIsClosingConfirmOpen(false);

    setNewItems([]);
    setRoundObservation("");
  }

  function closeTablePreview() {
    setSelectedTable(null);

    setCustomerName("");
    setPeople("1");

    setIsOpeningTable(false);
    setIsAddingItems(false);
    setIsClosingConfirmOpen(false);

    setNewItems([]);
    setRoundObservation("");
  }

  function startOpeningTable() {
    setCustomerName("");
    setPeople("1");

    setIsOpeningTable(true);
  }

  async function confirmOpenTable() {
    if (!selectedTable) {
      return;
    }

    const peopleNumber =
      Number(people);

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

    setIsOpeningTable(false);
  }

  function startAddingItems() {
    setNewItems([]);
    setRoundObservation("");
    setIsAddingItems(true);
  }

  function cancelAddingItems() {
    setNewItems([]);
    setRoundObservation("");
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

    const tableLabel =
      `Mesa ${String(
        selectedTable.number,
      ).padStart(2, "0")}`;

    const itemsDescription =
      newItems
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

      total:
        formatCurrency(roundTotal),

      items: itemsDescription,

      status: "preparing",

      delayed: false,

      tableNumber: String(
        selectedTable.number,
      ),

      itemDetails: newItems.map(
        (item) => ({
          productId:
            item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }),
      ),

      observation:
        roundObservation.trim() ||
        undefined,
    };

    const realOrderId =
      await addOrder(kitchenOrder);

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
    setRoundObservation("");

    setIsAddingItems(false);
  }

  function openTableClosingConfirm() {
    if (!selectedTable) {
      return;
    }

    if (
      (selectedTable.total ?? 0) <=
      0
    ) {
      return;
    }

    setIsClosingConfirmOpen(
      true,
    );
  }

  function cancelTableClosing() {
    setIsClosingConfirmOpen(
      false,
    );
  }

  async function confirmTableClosing() {
    if (!selectedTable) {
      return;
    }

    const updatedTable =
      await requestTableClosing(
        selectedTable.id,
      );

    if (updatedTable) {
      setSelectedTable(updatedTable);
    }

    setIsClosingConfirmOpen(
      false,
    );
  }

  return (
    <main className="waiter-app">
      <WaiterHeader />

      <section className="waiter-home">
        <div className="waiter-home__heading">
          <div>
            <span>Salão</span>

            <h1>Mesas</h1>

            <p>
              Toque em uma mesa para
              abrir ou acompanhar a
              comanda.
            </p>
          </div>

          <div className="waiter-home__counter">
            <span>Ocupadas</span>

            <strong>
              {occupiedCount}/
              {tables.length}
            </strong>
          </div>
        </div>

        <WaiterTableFilters
          tables={tables}
          activeFilter={
            activeTableFilter
          }
          searchTerm={
            tableSearchTerm
          }
          onFilterChange={
            setActiveTableFilter
          }
          onSearchChange={
            setTableSearchTerm
          }
        />

        <div className="waiter-home__grid">
          {filteredTables.map(
            (table) => (
              <WaiterTableCard
                key={table.id}
                table={table}
                onOpen={
                  openTablePreview
                }
              />
            ),
          )}
        </div>

        {filteredTables.length ===
          0 && (
          <div className="waiter-tables-empty">
            <strong>
              Nenhuma mesa
              encontrada
            </strong>

            <span>
              Tente outro filtro ou
              termo de busca.
            </span>
          </div>
        )}
      </section>

      {selectedTable && (
        <div className="waiter-table-preview">
          <button
            type="button"
            className="waiter-table-preview__backdrop"
            onClick={
              closeTablePreview
            }
            aria-label="Fechar"
          />

          <section className="waiter-table-preview__panel">
            <button
              type="button"
              className="waiter-table-preview__close"
              onClick={
                closeTablePreview
              }
              aria-label="Fechar"
            >
              ×
            </button>

            <span>Mesa</span>

            <h2>
              {String(
                selectedTable.number,
              ).padStart(2, "0")}
            </h2>

            {selectedTable.status ===
              "free" &&
              !isOpeningTable && (
                <>
                  <p>
                    Mesa livre para
                    iniciar um novo
                    atendimento.
                  </p>

                  <button
                    type="button"
                    className="waiter-table-preview__primary"
                    onClick={
                      startOpeningTable
                    }
                  >
                    <Plus
                      size={18}
                      weight="bold"
                    />

                    Abrir mesa
                  </button>
                </>
              )}

            {selectedTable.status ===
              "free" &&
              isOpeningTable && (
                <div className="waiter-open-table">
                  <button
                    type="button"
                    className="waiter-back-button"
                    onClick={() =>
                      setIsOpeningTable(
                        false,
                      )
                    }
                  >
                    <ArrowLeft
                      size={16}
                      weight="bold"
                    />

                    Voltar
                  </button>

                  <div className="waiter-open-table__heading">
                    <span>
                      Novo atendimento
                    </span>

                    <h3>
                      Abrir Mesa{" "}
                      {String(
                        selectedTable.number,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </h3>
                  </div>

                  <label className="waiter-form-field">
                    <span>
                      Nome do cliente

                      <small>
                        Opcional
                      </small>
                    </span>

                    <input
                      type="text"
                      value={
                        customerName
                      }
                      onChange={(
                        event,
                      ) =>
                        setCustomerName(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Ex.: Carlos"
                    />
                  </label>

                  <label className="waiter-form-field">
                    <span>
                      Quantidade de
                      pessoas
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={people}
                      onChange={(
                        event,
                      ) =>
                        setPeople(
                          event.target
                            .value
                            .replace(
                              /\D/g,
                              "",
                            )
                            .slice(
                              0,
                              2,
                            ),
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="waiter-table-preview__primary"
                    onClick={
                      confirmOpenTable
                    }
                    disabled={
                      Number(people) <
                      1
                    }
                  >
                    Abrir atendimento
                  </button>
                </div>
              )}

            {selectedTable.status !==
              "free" &&
              !isAddingItems && (
                <>
                  <div className="waiter-table-preview__info">
                    <strong>
                      {selectedTable.customerName ||
                        `Mesa ${String(
                          selectedTable.number,
                        ).padStart(
                          2,
                          "0",
                        )}`}
                    </strong>

                    <span>
                      {selectedTable.people ??
                        1}{" "}

                      {(selectedTable.people ??
                        1) === 1
                        ? "pessoa"
                        : "pessoas"}

                      {selectedTable.openedAt
                        ? ` · ${selectedTable.openedAt}`
                        : ""}
                    </span>
                  </div>

                  <div className="waiter-table-preview__command">
                    <div className="waiter-table-preview__command-heading">
                      <span>
                        Comanda
                      </span>

                      <strong>
                        {formatCurrency(
                          selectedTable.total ??
                            0,
                        )}
                      </strong>
                    </div>

                    {selectedTable
                      .commandItems
                      ?.length ? (
                      <div className="waiter-command-list">
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
                                x{" "}
                                {
                                  item.name
                                }
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
                      <p className="waiter-command-empty">
                        Nenhum produto
                        lançado ainda.
                      </p>
                    )}
                  </div>

                  {selectedTable.status ===
                    "occupied" && (
                    <div className="waiter-table-actions">
                      <button
                        type="button"
                        className="waiter-table-preview__primary"
                        onClick={
                          startAddingItems
                        }
                      >
                        <Plus
                          size={18}
                          weight="bold"
                        />

                        Adicionar
                        itens
                      </button>

                      <button
                        type="button"
                        className="waiter-table-preview__secondary"
                        onClick={
                          openTableClosingConfirm
                        }
                        disabled={
                          (selectedTable.total ??
                            0) <= 0
                        }
                      >
                        Solicitar
                        fechamento
                      </button>
                    </div>
                  )}

                  {selectedTable.status ===
                    "waiting-payment" && (
                    <div className="waiter-payment-warning">
                      Fechamento
                      solicitado.
                      Aguardando
                      pagamento.
                    </div>
                  )}
                </>
              )}

            {selectedTable.status !==
              "free" &&
              isAddingItems && (
                <div className="waiter-add-items">
                  <button
                    type="button"
                    className="waiter-back-button"
                    onClick={
                      cancelAddingItems
                    }
                  >
                    <ArrowLeft
                      size={16}
                      weight="bold"
                    />

                    Voltar para
                    comanda
                  </button>

                  <WaiterOrderForm
                    items={newItems}
                    onChange={
                      setNewItems
                    }
                  />

                  <label className="waiter-round-observation">
                    <span>
                      Observação para
                      cozinha

                      <small>
                        Opcional
                      </small>
                    </span>

                    <textarea
                      value={
                        roundObservation
                      }
                      onChange={(
                        event,
                      ) =>
                        setRoundObservation(
                          event.target.value.slice(
                            0,
                            200,
                          ),
                        )
                      }
                      placeholder="Ex.: sem cebola, carne bem passada, molho separado..."
                      maxLength={200}
                    />

                    <small>
                      {
                        roundObservation.length
                      }
                      /200
                    </small>
                  </label>

                  <div className="waiter-send-round">
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
                        newItems.length ===
                        0
                      }
                    >
                      <CookingPot
                        size={18}
                        weight="bold"
                      />

                      Enviar
                    </button>
                  </div>
                </div>
              )}
          </section>
        </div>
      )}

      {isClosingConfirmOpen &&
        selectedTable && (
          <div className="waiter-confirm">
            <button
              type="button"
              className="waiter-confirm__backdrop"
              aria-label="Cancelar fechamento"
              onClick={
                cancelTableClosing
              }
            />

            <section
              className="waiter-confirm__card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="waiter-confirm-title"
            >
              <div className="waiter-confirm__icon">
                !
              </div>

              <div className="waiter-confirm__heading">
                <span>
                  Fechamento da mesa
                </span>

                <h3 id="waiter-confirm-title">
                  Solicitar
                  fechamento?
                </h3>

                <p>
                  A Mesa{" "}
                  {String(
                    selectedTable.number,
                  ).padStart(
                    2,
                    "0",
                  )}{" "}
                  ficará aguardando
                  pagamento e não será
                  possível adicionar
                  novos itens.
                </p>
              </div>

              <div className="waiter-confirm__summary">
                <div>
                  <span>Mesa</span>

                  <strong>
                    {String(
                      selectedTable.number,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Total da comanda
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedTable.total ??
                        0,
                    )}
                  </strong>
                </div>
              </div>

              <div className="waiter-confirm__actions">
                <button
                  type="button"
                  className="waiter-confirm__cancel"
                  onClick={
                    cancelTableClosing
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="waiter-confirm__confirm"
                  onClick={
                    confirmTableClosing
                  }
                >
                  Solicitar
                  fechamento
                </button>
              </div>
            </section>
          </div>
        )}
    </main>
  );
}