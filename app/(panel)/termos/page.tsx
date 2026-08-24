"use client";

import { FileText } from "@phosphor-icons/react";

export default function TermosPage() {
  return (
    <section className="legal-page">
      <header className="legal-page__header">
        <span>Jurídico</span>
        <h1>Termos de uso</h1>
      </header>

      <article className="legal-page__pending">
        <FileText
          size={32}
          weight="duotone"
        />

        <h2>Em elaboração</h2>

        <p>
          O texto oficial dos Termos de Uso e da
          Política de Privacidade ainda será
          definido e publicado aqui.
        </p>
      </article>
    </section>
  );
}
