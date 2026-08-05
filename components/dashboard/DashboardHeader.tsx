export function DashboardHeader() {
  return (
    <section className="dashboard__heading">
      <div>
        <span className="dashboard__eyebrow">
          Terça-feira, 4 de agosto
        </span>

        <h1>Boa tarde, Débora!</h1>

        <p>
          Acompanhe tudo o que está acontecendo na Burger House.
        </p>
      </div>

      <button type="button" className="dashboard__primary-action">
        <span>+</span>
        Novo pedido
      </button>
    </section>
  );
}