import Image from "next/image";
import Link from "next/link";

import { House, SmileyXEyes } from "@phosphor-icons/react/dist/ssr";

export default function NotFoundPage() {
  return (
    <section className="error-page">
      <div className="error-page__card">
        <Image
          src="/logo-mais-pedido.png"
          alt="+Pedido"
          width={140}
          height={44}
          className="error-page__logo"
        />

        <div className="error-page__icon error-page__icon--neutral">
          <SmileyXEyes size={28} weight="fill" />
        </div>

        <h1>Página não encontrada</h1>

        <p>
          Esse endereço não existe ou foi movido. Confira o link
          ou volte para o início.
        </p>

        <div className="error-page__actions">
          <Link
            href="/"
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
