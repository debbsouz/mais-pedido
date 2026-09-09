"use client";

import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { ImageSquare, Trash } from "@phosphor-icons/react";

import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";
import { createClient } from "@/lib/supabase/client";

import {
  getStoreSettings,
  updateBrandingSettings,
} from "@/app/actions/store-settings";

type UploadTarget = "logo" | "banner";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function IdentidadeVisualPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(
    null,
  );

  const [bannerUrl, setBannerUrl] = useState<
    string | null
  >(null);

  const [uploading, setUploading] =
    useState<UploadTarget | null>(null);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getStoreSettings().then((settings) => {
      if (!settings) {
        return;
      }

      setLogoUrl(settings.logoUrl);
      setBannerUrl(settings.bannerUrl);
    });
  }, []);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
    target: UploadTarget,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        "Envie um arquivo de imagem (PNG, JPG ou WEBP).",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "A imagem precisa ter até 5MB.",
      );
      return;
    }

    setErrorMessage(null);
    setUploading(target);

    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const filePath = `${target}s/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("organization-branding")
      .upload(filePath, file);

    if (uploadError) {
      setUploading(null);
      setErrorMessage(
        "Não foi possível enviar a imagem. Tente novamente.",
      );
      return;
    }

    const { data } = supabase.storage
      .from("organization-branding")
      .getPublicUrl(filePath);

    const newLogoUrl =
      target === "logo" ? data.publicUrl : logoUrl;

    const newBannerUrl =
      target === "banner" ? data.publicUrl : bannerUrl;

    const result = await updateBrandingSettings({
      logoUrl: newLogoUrl,
      bannerUrl: newBannerUrl,
    });

    setUploading(null);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    if (target === "logo") {
      setLogoUrl(data.publicUrl);
    } else {
      setBannerUrl(data.publicUrl);
    }
  }

  async function handleRemove(target: UploadTarget) {
    setErrorMessage(null);

    const result = await updateBrandingSettings({
      logoUrl: target === "logo" ? null : logoUrl,
      bannerUrl: target === "banner" ? null : bannerUrl,
    });

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    if (target === "logo") {
      setLogoUrl(null);
    } else {
      setBannerUrl(null);
    }
  }

  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>Identidade visual</h2>
          <p>
            Logo e banner exibidos para os clientes no
            cardápio digital.
          </p>
        </div>

        <SettingsHelp>
          <p>
            A logo aparece no topo da sua loja pública,
            e o banner fica atrás dela. Use imagens PNG,
            JPG ou WEBP de até 5MB.
          </p>
        </SettingsHelp>
      </div>

      <div className="settings-card settings-brand__uploads">
        <div
          className="settings-brand__upload settings-brand__upload--clickable"
          data-filled={logoUrl ? "true" : undefined}
          onClick={() => logoInputRef.current?.click()}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="settings-brand__preview settings-brand__preview--logo"
            />
          ) : (
            <>
              <ImageSquare size={30} weight="duotone" />
              <strong>Logo</strong>
              <span>PNG, JPG ou WEBP</span>
            </>
          )}

          {uploading === "logo" && (
            <span className="settings-brand__uploading">
              Enviando...
            </span>
          )}

          {logoUrl && (
            <button
              type="button"
              className="settings-brand__remove"
              aria-label="Remover logo"
              onClick={(event) => {
                event.stopPropagation();
                void handleRemove("logo");
              }}
            >
              <Trash size={15} weight="bold" />
            </button>
          )}

          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="settings-brand__input"
            onChange={(event) =>
              handleUpload(event, "logo")
            }
          />
        </div>

        <div
          className="settings-brand__upload settings-brand__upload--clickable"
          data-filled={bannerUrl ? "true" : undefined}
          onClick={() =>
            bannerInputRef.current?.click()
          }
        >
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt="Banner"
              className="settings-brand__preview settings-brand__preview--banner"
            />
          ) : (
            <>
              <ImageSquare size={30} weight="duotone" />
              <strong>Banner</strong>
              <span>PNG, JPG ou WEBP</span>
            </>
          )}

          {uploading === "banner" && (
            <span className="settings-brand__uploading">
              Enviando...
            </span>
          )}

          {bannerUrl && (
            <button
              type="button"
              className="settings-brand__remove"
              aria-label="Remover banner"
              onClick={(event) => {
                event.stopPropagation();
                void handleRemove("banner");
              }}
            >
              <Trash size={15} weight="bold" />
            </button>
          )}

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="settings-brand__input"
            onChange={(event) =>
              handleUpload(event, "banner")
            }
          />
        </div>
      </div>

      {errorMessage && (
        <p className="settings-form__note settings-form__note--error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
