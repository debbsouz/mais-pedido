export function OperationHeader() {
  return (
    <section className="dashboard__heading">
      <div>
        <span className="dashboard__eyebrow">
          Central de operações
        </span>

        <h1>Boa tarde, Débora!</h1>

        <p>
          Veja o que está acontecendo agora na Burger House.
        </p>
      </div>

      <button type="button" className="dashboard__primary-action">
        <span>+</span>
        Novo pedido
      </button>
    </section>
  );
}