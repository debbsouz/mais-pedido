"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import type { RestaurantTable } from "@/components/mesas/TableCard";
import type { NewOrderItem } from "@/components/pedidos/OrderItemsForm";

import {
  addTable as addTableAction,
  cancelTableClosing as cancelTableClosingAction,
  openTable as openTableAction,
  releaseTable as releaseTableAction,
  removeTable as removeTableAction,
  requestTableClosing as requestTableClosingAction,
} from "@/app/actions/tables";

import { createClient } from "@/lib/supabase/client";

interface TablesContextValue {
  tables: RestaurantTable[];

  /** Abre a mesa (livre → ocupada) com cliente/pessoas informados. */
  openTable: (
    tableId: string,
    customerName: string,
    people: number,
  ) => Promise<RestaurantTable | null>;

  /**
   * Soma uma nova rodada de itens à comanda local, depois que o
   * pedido correspondente já foi criado de verdade (addOrder). Não
   * chama o servidor — o total real já está salvo em `orders`; isso
   * só mantém a comanda visível em dia sem precisar recarregar.
   */
  mergeTableRound: (
    tableId: string,
    items: NewOrderItem[],
  ) => RestaurantTable | null;

  /** Ocupada → aguardando pagamento. */
  requestTableClosing: (
    tableId: string,
  ) => Promise<RestaurantTable | null>;

  /** Aguardando pagamento → ocupada de novo (cancela o fechamento). */
  cancelTableClosing: (
    tableId: string,
  ) => Promise<RestaurantTable | null>;

  /** Confirma o pagamento e libera a mesa para um novo atendimento. */
  releaseTable: (tableId: string) => Promise<boolean>;

  /** Adiciona uma mesa nova ao layout do salão (owner/manager). */
  addTable: () => Promise<RestaurantTable | null>;

  /** Remove uma mesa livre do layout do salão (owner/manager). */
  removeTable: (tableId: string) => Promise<boolean>;
}

const TablesContext =
  createContext<TablesContextValue | null>(null);

function mergeItemsIntoCommand(
  currentItems: NewOrderItem[],
  newItems: NewOrderItem[],
) {
  const mergedItems = [...currentItems];

  newItems.forEach((newItem) => {
    const existingIndex = mergedItems.findIndex(
      (item) => item.productId === newItem.productId,
    );

    if (existingIndex >= 0) {
      mergedItems[existingIndex] = {
        ...mergedItems[existingIndex],
        quantity:
          mergedItems[existingIndex].quantity +
          newItem.quantity,
      };
      return;
    }

    mergedItems.push(newItem);
  });

  return mergedItems;
}

export function TablesProvider({
  children,
  initialTables,
}: {
  children: ReactNode;
  initialTables?: RestaurantTable[];
}) {
  const [tables, setTables] = useState<RestaurantTable[]>(
    initialTables ?? [],
  );

  async function openTable(
    tableId: string,
    customerName: string,
    people: number,
  ): Promise<RestaurantTable | null> {
    const result = await openTableAction(
      tableId,
      customerName,
      people,
    );

    if (!result.success) {
      window.alert(result.error);
      return null;
    }

    let updated: RestaurantTable | null = null;

    setTables((currentTables) =>
      currentTables.map((table) => {
        if (table.id !== tableId) {
          return table;
        }

        updated = {
          ...table,
          status: "occupied",
          customerName: customerName.trim() || undefined,
          people,
          total: 0,
          openedAt: "agora",
          commandItems: [],
        };

        return updated;
      }),
    );

    return updated;
  }

  function mergeTableRound(
    tableId: string,
    items: NewOrderItem[],
  ): RestaurantTable | null {
    if (items.length === 0) {
      return null;
    }

    const roundTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    let updated: RestaurantTable | null = null;

    setTables((currentTables) =>
      currentTables.map((table) => {
        if (table.id !== tableId) {
          return table;
        }

        updated = {
          ...table,
          status: "occupied",
          commandItems: mergeItemsIntoCommand(
            table.commandItems ?? [],
            items,
          ),
          total: (table.total ?? 0) + roundTotal,
        };

        return updated;
      }),
    );

    return updated;
  }

  async function requestTableClosing(
    tableId: string,
  ): Promise<RestaurantTable | null> {
    const result = await requestTableClosingAction(tableId);

    if (!result.success) {
      window.alert(result.error);
      return null;
    }

    let updated: RestaurantTable | null = null;

    setTables((currentTables) =>
      currentTables.map((table) => {
        if (table.id !== tableId) {
          return table;
        }

        updated = { ...table, status: "waiting-payment" };
        return updated;
      }),
    );

    return updated;
  }

  async function cancelTableClosing(
    tableId: string,
  ): Promise<RestaurantTable | null> {
    const result = await cancelTableClosingAction(tableId);

    if (!result.success) {
      window.alert(result.error);
      return null;
    }

    let updated: RestaurantTable | null = null;

    setTables((currentTables) =>
      currentTables.map((table) => {
        if (table.id !== tableId) {
          return table;
        }

        updated = { ...table, status: "occupied" };
        return updated;
      }),
    );

    return updated;
  }

  async function releaseTable(
    tableId: string,
  ): Promise<boolean> {
    const result = await releaseTableAction(tableId);

    if (!result.success) {
      window.alert(result.error);
      return false;
    }

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === tableId
          ? {
              id: table.id,
              number: table.number,
              status: "free",
            }
          : table,
      ),
    );

    return true;
  }

  async function addTable(): Promise<RestaurantTable | null> {
    const result = await addTableAction();

    if (!result.success) {
      window.alert(result.error);
      return null;
    }

    const newTable: RestaurantTable = {
      id: result.data!.id,
      number: result.data!.number,
      status: "free",
    };

    setTables((currentTables) => [
      ...currentTables,
      newTable,
    ]);

    return newTable;
  }

  async function removeTable(
    tableId: string,
  ): Promise<boolean> {
    const result = await removeTableAction(tableId);

    if (!result.success) {
      window.alert(result.error);
      return false;
    }

    setTables((currentTables) =>
      currentTables.filter((table) => table.id !== tableId),
    );

    return true;
  }

  /**
   * Real-time: mantem free/occupied/waiting-payment em dia entre o
   * painel, o app do Garçom e o app do Atendente, sem precisar
   * recarregar a pagina. Mesmo padrao/motivo do OrdersProvider —
   * so subscreve depois que a sessao (JWT) esta confirmada, senao o
   * RLS bloqueia os eventos no socket.
   */
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null =
      null;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session) {
        return;
      }

      channel = supabase
        .channel("restaurant-tables-realtime")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "restaurant_tables",
          },
          (payload) => {
            const row = payload.new as Record<
              string,
              unknown
            >;

            const rowId = row.id as string | undefined;

            if (!rowId) {
              return;
            }

            const status =
              row.status as RestaurantTable["status"];

            setTables((currentTables) =>
              currentTables.map((table) => {
                if (table.id !== rowId) {
                  return table;
                }

                if (status === "free") {
                  return {
                    id: table.id,
                    number: table.number,
                    status: "free",
                  };
                }

                // Mesa aberta/alterada em outro dispositivo: adota
                // os dados de quem sentou, mas so zera a comanda se
                // ainda nao tinhamos nenhum item local (mesa recem
                // aberta) — evita apagar itens ja lancados por essa
                // mesma aba.
                return {
                  ...table,
                  status,
                  customerName:
                    (row.customer_name as string) ||
                    undefined,
                  people:
                    (row.people_count as number) ??
                    undefined,
                  total: table.commandItems?.length
                    ? table.total
                    : 0,
                  openedAt:
                    table.openedAt ?? "agora",
                  commandItems:
                    table.commandItems ?? [],
                };
              }),
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "restaurant_tables",
          },
          (payload) => {
            const row = payload.new as Record<
              string,
              unknown
            >;

            const rowId = row.id as string | undefined;

            if (!rowId) {
              return;
            }

            setTables((currentTables) => {
              if (
                currentTables.some(
                  (table) => table.id === rowId,
                )
              ) {
                return currentTables;
              }

              return [
                ...currentTables,
                {
                  id: rowId,
                  number: row.number as number,
                  status:
                    row.status as RestaurantTable["status"],
                },
              ].sort((a, b) => a.number - b.number);
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "restaurant_tables",
          },
          (payload) => {
            const deletedId = (
              payload.old as Record<string, unknown>
            )?.id as string | undefined;

            if (deletedId) {
              setTables((currentTables) =>
                currentTables.filter(
                  (table) => table.id !== deletedId,
                ),
              );
            }
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <TablesContext.Provider
      value={{
        tables,
        openTable,
        mergeTableRound,
        requestTableClosing,
        cancelTableClosing,
        releaseTable,
        addTable,
        removeTable,
      }}
    >
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const context = useContext(TablesContext);

  if (!context) {
    throw new Error(
      "useTables deve ser usado dentro de TablesProvider.",
    );
  }

  return context;
}
