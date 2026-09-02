"use client";

import {
  CaretDown,
  ChatCircleDots,
  Lifebuoy,
} from "@phosphor-icons/react";

const faqItems = [
  {
    question: "Como funciona o status dos pedidos?",
    answer:
      "Cada pedido passa por 4 etapas: Aguardando confirmação, Em preparo, Pronto e Em entrega. Você acompanha tudo em Pedidos e também na Cozinha.",
  },
  {
    question: "Como sei se um pedido está demorando demais?",
    answer:
      "Na Cozinha e em Entregas, os pedidos ficam destacados em amarelo (atenção) ou vermelho (crítico) conforme o tempo desde que foram feitos.",
  },
  {
    question: "Como funcionam os status das mesas?",
    answer:
      "Cada mesa pode estar Livre, Ocupada ou Aguardando pagamento. Você altera o status diretamente na tela de Mesas.",
  },
  {
    question: "Como cadastro um produto novo no cardápio?",
    answer:
      "Vá em Cardápio e clique em Novo produto. Preencha nome, categoria, preço e, se quiser, uma foto.",
  },
  {
    question: "Como troco entre modo claro e escuro?",
    answer:
      "Use o ícone de sol/lua no topo da tela, ao lado das notificações.",
  },
  {
    question: "Onde vejo meus dados e meu cargo?",
    answer:
      "Clique no seu nome no canto superior direito e escolha Meu perfil.",
  },
  {
    question: "Onde vejo o plano atual da empresa?",
    answer:
      "Em Configurações você encontra o plano atual e um jeito de falar com o time comercial para mudar de plano.",
  },
  {
    question: "Como cadastro um funcionário (garçom, cozinha, entregador)?",
    answer:
      "Em breve você vai poder convidar sua equipe direto em Configurações > Equipe.",
  },
];

export default function AjudaPage() {
  return (
    <section className="help-page">
      <header className="help-page__header">
        <span>Suporte</span>
        <h1>Central de ajuda</h1>
        <p>Dúvidas comuns sobre como usar o +Pedido.</p>
      </header>

      <div className="help-faq">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="help-faq__item"
          >
            <summary>
              {item.question}
              <CaretDown
                size={16}
                weight="bold"
              />
            </summary>

            <p>{item.answer}</p>
          </details>
        ))}
      </div>

      <article className="settings-card help-page__contact">
        <div className="settings-card__header">
          <Lifebuoy
            size={20}
            weight="bold"
          />
          <h2>Ainda com dúvidas?</h2>
        </div>

        <p className="settings-card__hint">
          Fale com o nosso time de suporte.
        </p>

        <button
          type="button"
          className="settings-plan__cta"
          disabled
        >
          <ChatCircleDots
            size={18}
            weight="bold"
          />
          Falar com o suporte
        </button>

        <small className="settings-form__note">
          Em breve você vai poder falar direto com o
          nosso suporte por aqui.
        </small>
      </article>
    </section>
  );
}
