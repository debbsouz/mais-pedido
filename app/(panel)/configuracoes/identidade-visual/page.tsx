"use client";

import { ImageSquare } from "@phosphor-icons/react";

import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";

export default function IdentidadeVisualPage() {
  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>
            Identidade visual
            <span className="settings-section__badge">
              Em breve
            </span>
          </h2>
          <p>
            Logo e banner exibidos para os clientes no
            cardápio digital.
          </p>
        </div>

        <SettingsHelp>
          <p>
            A logo aparece no topo da sua loja
            pública, e o banner fica atrás dela. Use
            imagens PNG ou JPG. Essa tela ainda não
            está conectada ao envio de arquivos.
          </p>
        </SettingsHelp>
      </div>

      <div className="settings-brand__uploads">
        <div className="settings-brand__upload">
          <ImageSquare
            size={30}
            weight="duotone"
          />
          <strong>Logo</strong>
          <span>PNG ou JPG</span>
        </div>

        <div className="settings-brand__upload">
          <ImageSquare
            size={30}
            weight="duotone"
          />
          <strong>Banner</strong>
          <span>PNG ou JPG</span>
        </div>
      </div>
    </div>
  );
}
