"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  ArrowSquareOut,
  Copy,
  LinkSimple,
} from "@phosphor-icons/react";

import {
  getStoreSettings,
  updateAdsSettings,
  updateStoreSettings,
} from "@/app/actions/store-settings";
import { CashbackSection } from "@/components/configuracoes/CashbackSection";
import { CouponsSection } from "@/components/configuracoes/CouponsSection";
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
  const [metaPixelId, setMetaPixelId] =
    useState("");
  const [googleAdsId, setGoogleAdsId] =
    useState("");
  const [isSavingAds, setIsSavingAds] =
    useState(false);
  const [adsSaveMessage, setAdsSaveMessage] =
    useState<string | null>(null);

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
      setMetaPixelId(settings.metaPixelId ?? "");
      setGoogleAdsId(settings.googleAdsId ?? "");
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

  async function handleSaveAdsSettings(
    event: FormEvent,
  ) {
    event.preventDefault();

    setIsSavingAds(true);
    setAdsSaveMessage(null);

    const result = await updateAdsSettings({
      metaPixelId,
      googleAdsId,
    });

    setIsSavingAds(false);

    setAdsSaveMessage(
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

      <div className="settings-section__header settings-section__header--secondary">
        <div>
          <h3>Integração com anúncios</h3>
          <p>
            Cadastre o Pixel do Meta e/ou a tag do Google Ads pra
            medir suas campanhas — a criação e gestão dos anúncios
            continua sendo feita direto no Meta Ads Manager ou
            Google Ads, o +Pedido só carrega o rastreador na loja.
          </p>
        </div>

        <SettingsHelp>
          <p>
            <strong>Pixel do Meta</strong>: no Gerenciador de
            Eventos do Facebook, copie o número do Pixel (só
            dígitos). <strong>Google Ads</strong>: copie o ID de
            acompanhamento de conversão, algo como
            &quot;AW-XXXXXXXXX&quot;. Deixe em branco o que não
            usar.
          </p>
        </SettingsHelp>
      </div>

      <form
        className="settings-card settings-form settings-form--grid"
        onSubmit={handleSaveAdsSettings}
      >
        <div className="settings-form__field">
          <span>Pixel do Meta (Facebook/Instagram)</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex: 123456789012345"
            value={metaPixelId}
            onChange={(event) =>
              setMetaPixelId(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field">
          <span>ID do Google Ads</span>
          <input
            type="text"
            placeholder="Ex: AW-123456789"
            value={googleAdsId}
            onChange={(event) =>
              setGoogleAdsId(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field settings-form__field--full">
          <button
            type="submit"
            className="settings-form__submit"
            disabled={isSavingAds}
          >
            {isSavingAds
              ? "Salvando..."
              : "Salvar alterações"}
          </button>

          {adsSaveMessage && (
            <small className="settings-form__note">
              {adsSaveMessage}
            </small>
          )}
        </div>
      </form>

      <CouponsSection />

      <CashbackSection />
    </div>
  );
}
