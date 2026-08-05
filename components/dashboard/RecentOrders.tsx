export function RecentOrders() {
  return (
    <article className="dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <h2>Últimos pedidos</h2>
          <p>Movimentação recente</p>
        </div>

        <button type="button">Ver todos</button>
      </div>

      <div className="recent-orders">
        <div>
          <div>
            <strong>#1048 · Mariana</strong>
            <span>Delivery · 14:32</span>
          </div>

          <span className="status status--preparing">
            Em preparo
          </span>

          <b>R$ 58,90</b>
        </div>

        <div>
          <div>
            <strong>#1047 · Mesa 08</strong>
            <span>Garçom · 14:26</span>
          </div>

          <span className="status status--ready">
            Pronto
          </span>

          <b>R$ 96,50</b>
        </div>

        <div>
          <div>
            <strong>#1046 · Carlos</strong>
            <span>WhatsApp · 14:18</span>
          </div>

          <span className="status status--waiting">
            Aguardando
          </span>

          <b>R$ 42,00</b>
        </div>
      </div>
    </article>
  );
}