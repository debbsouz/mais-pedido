"use client";

import {
  CurrencyCircleDollar,
  Eye,
  MagnifyingGlass,
  PencilSimple,
  Phone,
  Plus,
  Repeat,
  Trash,
  User,
  Users,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";

import {
  createCustomer,
  deleteCustomer,
  getCustomersList,
  updateCustomer,
  type CustomerDto,
} from "@/app/actions/customers";

import {
  CustomerFormDrawer,
  type CustomerFormData,
} from "./CustomerFormDrawer";

import { CustomerProfileDrawer } from "./CustomerProfileDrawer";

type CustomerTier = "Novo" | "Recorrente" | "Fiel";

const ITEMS_PER_PAGE = 5;

function getCustomerTier(orders: number): CustomerTier {
  if (orders <= 1) return "Novo";
  if (orders >= 10) return "Fiel";

  return "Recorrente";
}

function toFormData(
  customer: CustomerDto,
): CustomerFormData {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    zipCode: customer.addressFields.zipCode,
    street: customer.addressFields.street,
    number: customer.addressFields.number,
    complement: customer.addressFields.complement,
    neighborhood: customer.addressFields.neighborhood,
    city: customer.addressFields.city,
    notes: customer.notes,
  };
}

export function CustomersManagement({
  initialCustomers,
}: {
  initialCustomers: CustomerDto[];
}) {
  const [customers, setCustomers] = useState<
    CustomerDto[]
  >(initialCustomers);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDto | null>(null);

  const [editingCustomer, setEditingCustomer] = useState<
    CustomerFormData | null | undefined
  >(undefined);

  const [removingId, setRemovingId] = useState<
    string | null
  >(null);

  async function refresh() {
    const fresh = await getCustomersList();
    setCustomers(fresh);
  }

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.phone.includes(search),
    );
  }, [customers, searchTerm]);

  const totalCustomers = customers.length;

  const newCustomers = customers.filter(
    (customer) => customer.ordersCount <= 1,
  ).length;

  const recurringCustomers = customers.filter(
    (customer) => customer.ordersCount > 1,
  ).length;

  const totalOrders = customers.reduce(
    (total, customer) => total + customer.ordersCount,
    0,
  );

  const totalRevenueCents = customers.reduce(
    (total, customer) =>
      total + customer.totalSpentCents,
    0,
  );

  const averageTicket =
    totalOrders > 0
      ? totalRevenueCents / 100 / totalOrders
      : 0;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedCustomers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredCustomers, safeCurrentPage]);

  const firstVisibleCustomer =
    filteredCustomers.length === 0
      ? 0
      : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const lastVisibleCustomer = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    filteredCustomers.length,
  );

  function handleSearch(value: string) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  async function handleSaveCustomer(
    formData: CustomerFormData,
    isNew: boolean,
  ) {
    const input = {
      id: isNew ? undefined : formData.id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      zipCode: formData.zipCode,
      street: formData.street,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      notes: formData.notes,
    };

    const result = isNew
      ? await createCustomer(input)
      : await updateCustomer(input);

    if (!result.success) {
      window.alert(result.error);
      return;
    }

    setEditingCustomer(undefined);
    await refresh();
  }

  async function handleRemove(customer: CustomerDto) {
    const shouldConfirm = window.confirm(
      `Remover ${customer.name} da base de clientes? O histórico de pedidos continua existindo, só o cadastro é apagado.`,
    );

    if (!shouldConfirm) {
      return;
    }

    setRemovingId(customer.id);
    const result = await deleteCustomer(customer.id);
    setRemovingId(null);

    if (!result.success) {
      window.alert(result.error);
      return;
    }

    await refresh();
  }

  return (
    <>
      <section className="customers-admin">
        <header className="customers-admin__header">
          <div>
            <span>Base de clientes</span>

            <h1>Clientes</h1>

            <p>
              Acompanhe quem já comprou, frequência de
              pedidos e gasto total.
            </p>
          </div>

          <button
            type="button"
            className="customers-admin__new"
            onClick={() =>
              setEditingCustomer(null)
            }
          >
            <Plus size={16} weight="bold" />
            Novo cliente
          </button>
        </header>

        <div className="customers-admin__stats">
          <article>
            <div>
              <span>Clientes cadastrados</span>
              <strong>{totalCustomers}</strong>
            </div>

            <Users size={25} />
          </article>

          <article>
            <div>
              <span>Novos clientes</span>
              <strong>{newCustomers}</strong>
            </div>

            <User size={25} />
          </article>

          <article>
            <div>
              <span>Clientes recorrentes</span>
              <strong>{recurringCustomers}</strong>
            </div>

            <Repeat size={25} />
          </article>

          <article>
            <div>
              <span>Ticket médio</span>
              <strong>
                {formatCurrency(averageTicket)}
              </strong>
            </div>

            <CurrencyCircleDollar size={25} />
          </article>
        </div>

        <div className="customers-admin__toolbar">
          <div className="customers-admin__search">
            <MagnifyingGlass size={19} />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                handleSearch(event.target.value)
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
            <span>Ticket médio</span>
            <span>Último pedido</span>
            <span>Ações</span>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="customers-admin__list">
              {paginatedCustomers.map((customer) => {
                const ticket =
                  customer.ordersCount > 0
                    ? customer.totalSpentCents /
                      100 /
                      customer.ordersCount
                    : 0;

                const tier = getCustomerTier(
                  customer.ordersCount,
                );

                return (
                  <article
                    key={customer.id}
                    className="customer-row customer-row--crm"
                  >
                    <div className="customer-row__customer">
                      <div className="customer-row__avatar">
                        <User size={21} weight="bold" />
                      </div>

                      <div>
                        <strong>
                          {customer.name}
                        </strong>

                        <span>
                          <Phone size={13} />
                          {customer.phone}
                        </span>

                        <small>
                          Cliente desde{" "}
                          {customer.customerSince.toLocaleDateString(
                            "pt-BR",
                          )}
                          {" · "}
                          {tier}
                        </small>
                      </div>
                    </div>

                    <div className="customer-row__orders">
                      <strong>
                        {customer.ordersCount}
                      </strong>
                      <span>pedidos</span>
                    </div>

                    <div className="customer-row__spent">
                      <strong>
                        {formatCurrency(
                          customer.totalSpentCents / 100,
                        )}
                      </strong>
                    </div>

                    <div className="customer-row__ticket">
                      <strong>
                        {formatCurrency(ticket)}
                      </strong>
                    </div>

                    <div className="customer-row__last">
                      {customer.lastOrderAt
                        ? customer.lastOrderAt.toLocaleString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "Nenhum ainda"}
                    </div>

                    <div className="customer-row__actions">
                      <button
                        type="button"
                        title="Ver perfil e histórico"
                        aria-label={`Ver perfil de ${customer.name}`}
                        onClick={() =>
                          setSelectedCustomer(customer)
                        }
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        title="Editar cliente"
                        aria-label={`Editar ${customer.name}`}
                        onClick={() =>
                          setEditingCustomer(
                            toFormData(customer),
                          )
                        }
                      >
                        <PencilSimple size={17} />
                      </button>

                      <button
                        type="button"
                        title="Remover cliente"
                        aria-label={`Remover ${customer.name}`}
                        disabled={
                          removingId === customer.id
                        }
                        onClick={() =>
                          handleRemove(customer)
                        }
                      >
                        <Trash size={17} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="customers-admin__empty">
              <Users size={31} />

              <strong>
                {customers.length === 0
                  ? "Nenhum cliente cadastrado ainda"
                  : "Nenhum cliente encontrado"}
              </strong>

              <span>
                {customers.length === 0
                  ? "Clientes aparecem aqui automaticamente assim que fizerem o primeiro pedido, ou cadastre um manualmente."
                  : "Não encontramos clientes correspondentes à sua busca."}
              </span>
            </div>
          )}

          {filteredCustomers.length > 0 && (
            <div className="customers-admin__pagination">
              <span className="customers-admin__pagination-info">
                Mostrando{" "}
                <strong>
                  {firstVisibleCustomer}–
                  {lastVisibleCustomer}
                </strong>{" "}
                de{" "}
                <strong>
                  {filteredCustomers.length}
                </strong>{" "}
                clientes
              </span>

              <div className="customers-admin__pagination-controls">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1),
                    )
                  }
                  disabled={safeCurrentPage === 1}
                  aria-label="Página anterior"
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      page === safeCurrentPage
                        ? "is-active"
                        : ""
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1),
                    )
                  }
                  disabled={
                    safeCurrentPage === totalPages
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
          <Users size={18} weight="bold" />

          <div>
            <strong>
              Clientes são cadastrados automaticamente
              pelos pedidos.
            </strong>

            <span>
              Quando um consumidor faz um novo pedido
              usando o mesmo telefone, o +Pedido
              reconhece o cadastro e atualiza o
              histórico. Você também pode cadastrar um
              cliente manualmente, antes do primeiro
              pedido.
            </span>
          </div>
        </div>
      </section>

      <CustomerProfileDrawer
        open={selectedCustomer !== null}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <CustomerFormDrawer
        open={editingCustomer !== undefined}
        customer={editingCustomer}
        onClose={() => setEditingCustomer(undefined)}
        onSave={(formData) =>
          handleSaveCustomer(
            formData,
            editingCustomer === null,
          )
        }
      />
    </>
  );
}
