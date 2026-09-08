"use client";

import { type FormEvent, useEffect, useState } from "react";

import { Plus, Trash } from "@phosphor-icons/react";

import {
  createPurchase,
  deletePurchase,
  getPurchases,
  type Purchase,
} from "@/app/actions/purchases";
import { formatCurrency } from "@/lib/format";

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function dateLabel(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function PurchasesSection() {
  const [purchases, setPurchases] = useState<
    Purchase[] | null
  >(null);
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    todayIso(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    string | null
  >(null);
  const [removingId, setRemovingId] = useState<
    string | null
  >(null);

  useEffect(() => {
    void getPurchases().then(setPurchases);
  }, []);

  const totalCents = (purchases ?? []).reduce(
    (sum, purchase) => sum + purchase.costCents,
    0,
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const costCents = Math.round(
      Number(cost.replace(",", ".")) * 100,
    );

    setIsSaving(true);
    setSaveMessage(null);

    const result = await createPurchase({
      supplier,
      description,
      costCents: Number.isFinite(costCents)
        ? costCents
        : 0,
      purchaseDate,
    });

    setIsSaving(false);

    if (result.success) {
      setSupplier("");
      setDescription("");
      setCost("");
      setPurchaseDate(todayIso());
      setSaveMessage("Compra registrada com sucesso.");
      void getPurchases().then(setPurchases);
      return;
    }

    setSaveMessage(result.error);
  }

  async function handleRemove(purchaseId: string) {
    setRemovingId(purchaseId);

    const result = await deletePurchase(purchaseId);

    setRemovingId(null);

    if (result.success) {
      void getPurchases().then(setPurchases);
    }
  }

  return (
    <section className="purchases-section">
      <div className="financeiro-header financeiro-header--secondary">
        <div>
          <h2>Registro de compras</h2>
          <p>
            Insumos, fornecedores e outras despesas dos últimos
            90 dias.
          </p>
        </div>
      </div>

      <div className="financeiro-card">
        <div className="purchases-summary">
          <span>Total no período</span>
          <strong>{formatCurrency(totalCents / 100)}</strong>
        </div>

        <form
          className="settings-form settings-form--grid purchases-form"
          onSubmit={handleSubmit}
        >
          <div className="settings-form__field">
            <span>Fornecedor</span>
            <input
              type="text"
              placeholder="Ex: Distribuidora ABC"
              value={supplier}
              onChange={(event) =>
                setSupplier(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field">
            <span>Descrição</span>
            <input
              type="text"
              placeholder="Ex: Carne, pão, embalagens"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field">
            <span>Valor (R$)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={cost}
              onChange={(event) =>
                setCost(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field">
            <span>Data</span>
            <input
              type="date"
              value={purchaseDate}
              onChange={(event) =>
                setPurchaseDate(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field settings-form__field--full">
            <button
              type="submit"
              className="settings-form__submit"
              disabled={isSaving}
            >
              <Plus size={16} weight="bold" />
              {isSaving
                ? "Registrando..."
                : "Registrar compra"}
            </button>

            {saveMessage && (
              <small className="settings-form__note">
                {saveMessage}
              </small>
            )}
          </div>
        </form>

        {purchases && purchases.length > 0 && (
          <ul className="team-list purchases-list">
            {purchases.map((purchase) => (
              <li key={purchase.id}>
                <div>
                  <strong>
                    {purchase.supplier} —{" "}
                    {purchase.description}
                  </strong>
                  <span>
                    {dateLabel(purchase.purchaseDate)} ·{" "}
                    {formatCurrency(
                      purchase.costCents / 100,
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Remover compra de ${purchase.supplier}`}
                  disabled={
                    removingId === purchase.id
                  }
                  onClick={() =>
                    handleRemove(purchase.id)
                  }
                >
                  <Trash size={16} weight="bold" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {purchases?.length === 0 && (
          <p className="settings-form__note">
            Nenhuma compra registrada nos últimos 90 dias.
          </p>
        )}
      </div>
    </section>
  );
}
