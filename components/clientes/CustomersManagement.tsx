"use client";

import {
  CurrencyCircleDollar,
  Eye,
  MagnifyingGlass,
  Phone,
  Repeat,
  ShoppingBag,
  Star,
  User,
  Users,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";

import {
  CustomerProfileDrawer,
  type CustomerProfile,
} from "./CustomerProfileDrawer";

type CustomerTier =
  | "Novo"
  | "Recorrente"
  | "Fiel";

const ITEMS_PER_PAGE = 5;

const customersMock: CustomerProfile[] = [
  {
    id: "1",
    name: "Mariana Souza",
    phone: "(51) 99912-3456",
    orders: 14,
    totalSpent: 847.5,
    lastOrder: "Hoje, 14:32",
    customerSince: "03/05/2026",
    loyaltyProgress: 8,
    loyaltyGoal: 10,
    address:
      "Rua João Neves, 248 - Centro, Cidreira/RS",
    history: [
      {
        id: "order-1058",
        displayNumber: "1058",
        date: "Hoje, 14:32",
        total: 72.9,
        channel: "Delivery",
        status: "Concluído",
        items:
          "2x X-Bacon, 1x Batata G, 1x Refrigerante",
      },
      {
        id: "order-1031",
        displayNumber: "1031",
        date: "03/08/2026",
        total: 54,
        channel: "Delivery",
        status: "Concluído",
        items:
          "1x X-Tudo, 1x Batata M, 1x Refrigerante",
      },
      {
        id: "order-1002",
        displayNumber: "1002",
        date: "25/07/2026",
        total: 68.5,
        channel: "Retirada",
        status: "Concluído",
        items:
          "2x X-Salada, 1x Porção de fritas",
      },
    ],
  },
  {
    id: "2",
    name: "Carlos Eduardo",
    phone: "(51) 99145-8821",
    orders: 8,
    totalSpent: 392.9,
    lastOrder: "Hoje, 12:18",
    customerSince: "18/06/2026",
    loyaltyProgress: 4,
    loyaltyGoal: 10,
    address: "",
    history: [],
  },
  {
    id: "3",
    name: "Amanda Oliveira",
    phone: "(51) 99876-1023",
    orders: 5,
    totalSpent: 241.4,
    lastOrder: "Ontem, 20:45",
    customerSince: "02/07/2026",
    loyaltyProgress: 5,
    loyaltyGoal: 10,
    address: "",
    history: [],
  },
  {
    id: "4",
    name: "Rafael Martins",
    phone: "(51) 99631-7412",
    orders: 2,
    totalSpent: 138.7,
    lastOrder: "Ontem, 19:12",
    customerSince: "01/08/2026",
    loyaltyProgress: 2,
    loyaltyGoal: 10,
    address: "",
    history: [],
  },
  {
    id: "5",
    name: "Fernanda Lima",
    phone: "(51) 99222-4567",
    orders: 16,
    totalSpent: 923.8,
    lastOrder: "09/08/2026",
    customerSince: "12/04/2026",
    loyaltyProgress: 9,
    loyaltyGoal: 10,
    address: "",
    history: [],
  },
  {
    id: "6",
    name: "Lucas Almeida",
    phone: "(51) 99731-8044",
    orders: 1,
    totalSpent: 48.9,
    lastOrder: "08/08/2026",
    customerSince: "08/08/2026",
    loyaltyProgress: 1,
    loyaltyGoal: 10,
    address: "",
    history: [],
  },
];

function getAverageTicket(
  customer: CustomerProfile,
) {
  return customer.orders > 0
    ? customer.totalSpent /
        customer.orders
    : 0;
}

function getCustomerTier(
  orders: number,
): CustomerTier {
  if (orders <= 1) return "Novo";
  if (orders >= 10) return "Fiel";

  return "Recorrente";
}

function getLoyaltyProgress(
  customer: CustomerProfile,
) {
  if (customer.loyaltyGoal <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (customer.loyaltyProgress /
        customer.loyaltyGoal) *
        100,
    ),
  );
}

export function CustomersManagement() {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] =
    useState<CustomerProfile | null>(
      null,
    );

  const filteredCustomers =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return customersMock;
      }

      return customersMock.filter(
        (customer) =>
          customer.name
            .toLowerCase()
            .includes(search) ||
          customer.phone.includes(
            search,
          ),
      );
    }, [searchTerm]);

  const totalCustomers =
    customersMock.length;

  const newCustomers =
    customersMock.filter(
      (customer) =>
        customer.orders === 1,
    ).length;

  const recurringCustomers =
    customersMock.filter(
      (customer) =>
        customer.orders > 1,
    ).length;

  const totalOrders =
    customersMock.reduce(
      (total, customer) =>
        total + customer.orders,
      0,
    );

  const totalRevenue =
    customersMock.reduce(
      (total, customer) =>
        total +
        customer.totalSpent,
      0,
    );

  const averageTicket =
    totalOrders > 0
      ? totalRevenue / totalOrders
      : 0;

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        ITEMS_PER_PAGE,
    ),
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedCustomers =
    useMemo(() => {
      const start =
        (safeCurrentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredCustomers.slice(
        start,
        start + ITEMS_PER_PAGE,
      );
    }, [
      filteredCustomers,
      safeCurrentPage,
    ]);

  const firstVisibleCustomer =
    filteredCustomers.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const lastVisibleCustomer =
    Math.min(
      safeCurrentPage *
        ITEMS_PER_PAGE,
      filteredCustomers.length,
    );

  function handleSearch(
    value: string,
  ) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  return (
    <>
      <section className="customers-admin">
        <header className="customers-admin__header">
          <div>
            <span>
              Base de clientes
            </span>

            <h1>Clientes</h1>

            <p>
              Acompanhe quem já
              comprou, frequência de
              pedidos, gasto total e
              evolução de fidelidade.
            </p>
          </div>
        </header>

        <div className="customers-admin__stats">
          <article>
            <div>
              <span>
                Clientes cadastrados
              </span>

              <strong>
                {totalCustomers}
              </strong>
            </div>

            <Users size={25} />
          </article>

          <article>
            <div>
              <span>
                Novos clientes
              </span>

              <strong>
                {newCustomers}
              </strong>
            </div>

            <User size={25} />
          </article>

          <article>
            <div>
              <span>
                Clientes recorrentes
              </span>

              <strong>
                {
                  recurringCustomers
                }
              </strong>
            </div>

            <Repeat size={25} />
          </article>

          <article>
            <div>
              <span>
                Ticket médio
              </span>

              <strong>
                {formatCurrency(
                  averageTicket,
                )}
              </strong>
            </div>

            <CurrencyCircleDollar
              size={25}
            />
          </article>
        </div>

        <div className="customers-admin__toolbar">
          <div className="customers-admin__search">
            <MagnifyingGlass
              size={19}
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                handleSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar por nome ou telefone..."
            />
          </div>
        </div>

        <div className="customers-admin__content">
          <div className="customers-admin__list-header customers-admin__list-header--crm">
            <span>Cliente</span>
            <span>Pedidos</span>
            <span>Total gasto</span>
            <span>
              Ticket médio
            </span>
            <span>
              Último pedido
            </span>
            <span>Fidelidade</span>
            <span>Ações</span>
          </div>

          {filteredCustomers.length >
          0 ? (
            <div className="customers-admin__list">
              {paginatedCustomers.map(
                (customer) => {
                  const ticket =
                    getAverageTicket(
                      customer,
                    );

                  const tier =
                    getCustomerTier(
                      customer.orders,
                    );

                  const progress =
                    getLoyaltyProgress(
                      customer,
                    );

                  return (
                    <article
                      key={
                        customer.id
                      }
                      className="customer-row customer-row--crm"
                    >
                      <div className="customer-row__customer">
                        <div className="customer-row__avatar">
                          <User
                            size={21}
                            weight="bold"
                          />
                        </div>

                        <div>
                          <strong>
                            {
                              customer.name
                            }
                          </strong>

                          <span>
                            <Phone
                              size={13}
                            />

                            {
                              customer.phone
                            }
                          </span>

                          <small>
                            Cliente desde{" "}
                            {
                              customer.customerSince
                            }
                          </small>
                        </div>
                      </div>

                      <div className="customer-row__orders">
                        <strong>
                          {
                            customer.orders
                          }
                        </strong>

                        <span>
                          pedidos
                        </span>
                      </div>

                      <div className="customer-row__spent">
                        <strong>
                          {formatCurrency(
                            customer.totalSpent,
                          )}
                        </strong>
                      </div>

                      <div className="customer-row__ticket">
                        <strong>
                          {formatCurrency(
                            ticket,
                          )}
                        </strong>
                      </div>

                      <div className="customer-row__last">
                        {
                          customer.lastOrder
                        }
                      </div>

                      <div className="customer-row__loyalty">
                        <div className="customer-row__loyalty-heading">
                          <span>
                            <Star
                              size={
                                13
                              }
                              weight={
                                tier ===
                                "Fiel"
                                  ? "fill"
                                  : "regular"
                              }
                            />

                            {tier}
                          </span>

                          <strong>
                            {
                              customer.loyaltyProgress
                            }
                            /
                            {
                              customer.loyaltyGoal
                            }
                          </strong>
                        </div>

                        <div className="customer-row__loyalty-bar">
                          <span
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="customer-row__actions">
                        <button
                          type="button"
                          title="Ver perfil e histórico"
                          aria-label={`Ver perfil de ${customer.name}`}
                          onClick={() =>
                            setSelectedCustomer(
                              customer,
                            )
                          }
                        >
                          <Eye
                            size={17}
                          />
                        </button>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="customers-admin__empty">
              <Users size={31} />

              <strong>
                Nenhum cliente
                encontrado
              </strong>

              <span>
                Não encontramos
                clientes
                correspondentes à
                sua busca.
              </span>
            </div>
          )}

          {filteredCustomers.length >
            0 && (
            <div className="customers-admin__pagination">
              <span className="customers-admin__pagination-info">
                Mostrando{" "}
                <strong>
                  {
                    firstVisibleCustomer
                  }
                  –
                  {
                    lastVisibleCustomer
                  }
                </strong>{" "}
                de{" "}
                <strong>
                  {
                    filteredCustomers.length
                  }
                </strong>{" "}
                clientes
              </span>

              <div className="customers-admin__pagination-controls">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1,
                        ),
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  aria-label="Página anterior"
                >
                  ‹
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      page ===
                      safeCurrentPage
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(
                        page,
                      )
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1,
                        ),
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  aria-label="Próxima página"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="customers-admin__insight">
          <ShoppingBag
            size={18}
            weight="bold"
          />

          <div>
            <strong>
              Clientes são
              cadastrados
              automaticamente pelos
              pedidos.
            </strong>

            <span>
              Quando um consumidor
              faz um novo pedido
              usando o mesmo
              telefone, o +Pedido
              reconhece o cadastro e
              atualiza
              automaticamente seu
              histórico.
            </span>
          </div>
        </div>
      </section>

      <CustomerProfileDrawer
        open={
          selectedCustomer !== null
        }
        customer={
          selectedCustomer
        }
        onClose={() =>
          setSelectedCustomer(null)
        }
      />
    </>
  );
}