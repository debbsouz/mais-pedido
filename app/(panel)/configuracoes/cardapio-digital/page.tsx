"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  ArrowSquareOut,
  Copy,
  LinkSimple,
} from "@phosphor-icons/react";

import {
  getStoreSettings,
  updateStoreSettings,
} from "@/app/actions/store-settings";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";

export default function CardapioDigitalPage() {
  const [storeSlug, setStoreSlug] = useState<
    string | null
  >(null);
  const [minOrder, setMinOrder] = useState("0");
  const [instagramUrl, setInstagramUrl] =
    useState("");
  const [isSavingStore, setIsSavingStore] =
    useState(false);
  const [storeSaveMessage, setStoreSaveMessage] =
    useState<string | null>(null);
  const [linkCopied, setLinkCopied] =
    useState(false);

  useEffect(() => {
    void getStoreSettings().then((settings) => {
      if (!settings) {
        return;
      }

      setStoreSlug(settings.slug);
      setMinOrder(
        (settings.minOrderCents / 100).toFixed(2),
      );
      setInstagramUrl(settings.instagramUrl ?? "");
    });
  }, []);

  const storeUrl =
    storeSlug && typeof window !== "undefined"
      ? `${window.location.origin}/loja/${storeSlug}`
      : null;

  async function handleCopyStoreUrl() {
    if (!storeUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(storeUrl);
      setLinkCopied(true);
      window.setTimeout(
        () => setLinkCopied(false),
        2000,
      );
    } catch {
      // Sem permissão de área de transferência — ignora.
    }
  }

  async function handleSaveStoreSettings(
    event: FormEvent,
  ) {
    event.preventDefault();

    setIsSavingStore(true);
    setStoreSaveMessage(null);

    const minOrderCents = Math.round(
      Number(minOrder.replace(",", ".")) * 100,
    );

    const result = await updateStoreSettings({
      minOrderCents: Number.isFinite(minOrderCents)
        ? minOrderCents
        : 0,
      instagramUrl,
    });

    setIsSavingStore(false);

    setStoreSaveMessage(
      result.success
        ? "Salvo com sucesso."
        : result.error,
    );
  }

  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>Cardápio Digital</h2>
          <p>
            O link da sua loja pública e o que os
            clientes veem nela.
          </p>
        </div>

        <SettingsHelp>
          <p>
            Essa é a página que o seu cliente acessa
            pelo link, sem precisar de login. Copie o
            link abaixo e envie no WhatsApp, Instagram
            ou onde preferir. O botão de WhatsApp da
            loja usa o telefone cadastrado na aba
            Estabelecimento, e a própria loja já tem um
            botão de compartilhar no topo.
          </p>
        </SettingsHelp>
      </div>

      <div className="settings-card">
        {storeUrl && (
          <div className="settings-store-link">
            <div className="settings-store-link__url">
              <LinkSimple size={16} />
              <span>{storeUrl}</span>
            </div>

            <div className="settings-store-link__actions">
              <button
                type="button"
                onClick={handleCopyStoreUrl}
                className="settings-store-link__button"
              >
                <Copy
                  size={15}
                  weight="bold"
                />
                {linkCopied
                  ? "Copiado!"
                  : "Copiar link"}
              </button>

              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="settings-store-link__button settings-store-link__button--primary"
              >
                <ArrowSquareOut
                  size={15}
                  weight="bold"
                />
                Ver minha loja
              </a>
            </div>
          </div>
        )}

        <form
          className="settings-form settings-form--grid"
          onSubmit={handleSaveStoreSettings}
        >
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

          <div className="settings-form__field">
            <span>Instagram</span>
            <input
              type="url"
              placeholder="https://instagram.com/suaempresa"
              value={instagramUrl}
              onChange={(event) =>
                setInstagramUrl(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field settings-form__field--full">
            <button
              type="submit"
              className="settings-form__submit"
              disabled={isSavingStore}
            >
              {isSavingStore
                ? "Salvando..."
                : "Salvar alterações"}
            </button>

            {storeSaveMessage && (
              <small className="settings-form__note">
                {storeSaveMessage}
              </small>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
