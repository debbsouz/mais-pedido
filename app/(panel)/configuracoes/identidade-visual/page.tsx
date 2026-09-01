"use client";

import { ImageSquare } from "@phosphor-icons/react";

import { SettingsPageHeader } from "@/components/configuracoes/SettingsPageHeader";

export default function IdentidadeVisualPage() {
  return (
    <section className="settings-page">
      <SettingsPageHeader
        icon={ImageSquare}
        title="Identidade visual"
        description="Logo e banner exibidos para os clientes no cardápio digital."
      />

      <div className="settings-page__cards settings-page__cards--single">
        <article className="settings-card">
          <div className="settings-card__header">
            <span className="settings-card__badge">
              Em breve
            </span>
          </div>

          <div className="settings-brand__uploads">
            <div className="settings-brand__upload">
              <ImageSquare
                size={26}
                weight="duotone"
              />
              <strong>Logo</strong>
              <span>PNG ou JPG</span>
            </div>

            <div className="settings-brand__upload">
              <ImageSquare
                size={26}
                weight="duotone"
              />
              <strong>Banner</strong>
              <span>PNG ou JPG</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
