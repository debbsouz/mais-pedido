"use client";

import { type FormEvent, useEffect, useState } from "react";

import { Tag, Trash } from "@phosphor-icons/react";

import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  toggleCouponActive,
  type Coupon,
  type DiscountType,
} from "@/app/actions/coupons";
import { formatCurrency } from "@/lib/format";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";
import { PlanLockedNotice } from "@/components/configuracoes/PlanLockedNotice";
import { useCurrentSubscription } from "@/components/providers/AuthProvider";
import { hasFeature } from "@/lib/access";

function discountLabel(coupon: Coupon) {
  return coupon.discountType === "percentage"
    ? `${coupon.discountValue}%`
    : formatCurrency(coupon.discountValue / 100);
}

export function CouponsSection() {
  const subscription = useCurrentSubscription();
  const isUnlocked = hasFeature(
    subscription.planId,
    "coupons",
  );

  const [coupons, setCoupons] = useState<
    Coupon[] | null
  >(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] =
    useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] =
    useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    string | null
  >(null);
  const [busyId, setBusyId] = useState<
    string | null
  >(null);

  useEffect(() => {
    void getCoupons().then(setCoupons);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const minOrderCents = Math.round(
      Number(minOrder.replace(",", ".")) * 100,
    );

    setIsSaving(true);
    setSaveMessage(null);

    const result = await createCoupon({
      code,
      discountType,
      discountValue: Math.round(
        Number(discountValue.replace(",", ".")),
      ),
      minOrderCents: Number.isFinite(minOrderCents)
        ? minOrderCents
        : 0,
    });

    setIsSaving(false);

    if (result.success) {
      setCode("");
      setDiscountValue("");
      setMinOrder("0");
      setSaveMessage("Cupom criado com sucesso.");
      void getCoupons().then(setCoupons);
      return;
    }

    setSaveMessage(result.error);
  }

  async function handleToggle(coupon: Coupon) {
    setBusyId(coupon.id);

    setCoupons((current) =>
      (current ?? []).map((item) =>
        item.id === coupon.id
          ? { ...item, isActive: !item.isActive }
          : item,
      ),
    );

    await toggleCouponActive(
      coupon.id,
      !coupon.isActive,
    );

    setBusyId(null);
  }

  async function handleDelete(couponId: string) {
    setBusyId(couponId);

    const result = await deleteCoupon(couponId);

    setBusyId(null);

    if (result.success) {
      void getCoupons().then(setCoupons);
    }
  }

  return (
    <>
      <div className="settings-section__header settings-section__header--secondary">
        <div>
          <h3>Cupons de desconto</h3>
          <p>
            Códigos que os clientes digitam no carrinho da loja
            pública pra ganhar desconto — aplicado e conferido de
            verdade, direto no servidor.
          </p>
        </div>

        <SettingsHelp>
          <p>
            Crie um código (ex: &quot;BEMVINDO10&quot;), escolha se
            o desconto é em porcentagem ou valor fixo, e opcionalmente
            um pedido mínimo pra valer. Desative um cupom a qualquer
            momento sem precisar apagar — ele para de funcionar na
            hora.
          </p>
        </SettingsHelp>
      </div>

      {!isUnlocked ? (
        <PlanLockedNotice feature="coupons" />
      ) : (
      <div className="settings-card">
        {coupons === null && (
          <p className="settings-form__note">Carregando...</p>
        )}

        {coupons?.length === 0 && (
          <p className="settings-form__note">
            Nenhum cupom criado ainda.
          </p>
        )}

        {coupons && coupons.length > 0 && (
          <ul className="team-list">
            {coupons.map((coupon) => (
              <li key={coupon.id}>
                <div>
                  <strong>{coupon.code}</strong>
                  <span>
                    {discountLabel(coupon)}
                    {coupon.minOrderCents > 0
                      ? ` · mín. ${formatCurrency(coupon.minOrderCents / 100)}`
                      : ""}
                    {" · "}
                    {coupon.isActive
                      ? "Ativo"
                      : "Desativado"}
                  </span>
                </div>

                <div className="coupons-list__actions">
                  <button
                    type="button"
                    className={`coupons-list__toggle${
                      coupon.isActive
                        ? " coupons-list__toggle--on"
                        : ""
                    }`}
                    disabled={busyId === coupon.id}
                    onClick={() =>
                      handleToggle(coupon)
                    }
                  >
                    {coupon.isActive
                      ? "Ativo"
                      : "Ativar"}
                  </button>

                  <button
                    type="button"
                    aria-label={`Remover cupom ${coupon.code}`}
                    disabled={busyId === coupon.id}
                    onClick={() =>
                      handleDelete(coupon.id)
                    }
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form
          className="settings-form settings-form--grid coupons-form"
          onSubmit={handleSubmit}
        >
          <div className="settings-form__field">
            <span>Código</span>
            <input
              type="text"
              placeholder="Ex: BEMVINDO10"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field">
            <span>Tipo de desconto</span>
            <select
              value={discountType}
              onChange={(event) =>
                setDiscountType(
                  event.target.value as DiscountType,
                )
              }
            >
              <option value="percentage">
                Porcentagem (%)
              </option>
              <option value="fixed">
                Valor fixo (R$)
              </option>
            </select>
          </div>

          <div className="settings-form__field">
            <span>
              {discountType === "percentage"
                ? "Desconto (%)"
                : "Desconto (R$)"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={
                discountType === "percentage"
                  ? "Ex: 10"
                  : "Ex: 15,00"
              }
              value={discountValue}
              onChange={(event) =>
                setDiscountValue(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="settings-form__field">
            <span>Pedido mínimo (R$)</span>
            <input
              type="text"
              inputMode="decimal"
              value={minOrder}
              onChange={(event) =>
                setMinOrder(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field settings-form__field--full">
            <button
              type="submit"
              className="settings-form__submit"
              disabled={isSaving}
            >
              <Tag size={16} weight="bold" />
              {isSaving
                ? "Criando..."
                : "Criar cupom"}
            </button>

            {saveMessage && (
              <small className="settings-form__note">
                {saveMessage}
              </small>
            )}
          </div>
        </form>
      </div>
      )}
    </>
  );
}
