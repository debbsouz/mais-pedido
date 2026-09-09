import Link from "next/link";

import { House, SmileyXEyes } from "@phosphor-icons/react/dist/ssr";

/**
 * 404 dentro do painel — a Sidebar/Topbar continuam visíveis (esse
 * not-found.tsx só substitui o conteúdo da página, não o layout),
 * mesmo motivo/padrão do app/(panel)/error.tsx.
 */
export default function PanelNotFoundPage() {
  return (
    <section className="error-page error-page--inline">
      <div className="error-page__card">
        <div className="error-page__icon error-page__icon--neutral">
          <SmileyXEyes size={28} weight="fill" />
        </div>

        <h1>Página não encontrada</h1>

        <p>
          Esse endereço não existe ou foi movido. Confira o link ou
          volte para o início.
        </p>

        <div className="error-page__actions">
          <Link
            href="/inicio"
            className="error-page__button error-page__button--primary"
          >
            <House size={16} weight="bold" />
            Voltar para o início
          </Link>
        </div>
      </div>
    </section>
  );
}
