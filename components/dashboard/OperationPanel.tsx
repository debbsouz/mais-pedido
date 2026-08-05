export function OperationPanel() {
  return (
    <article className="dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <h2>Operação agora</h2>
          <p>Resumo em tempo real</p>
        </div>

        <button type="button">Ver operação</button>
      </div>

      <div className="operation-list">
        <div>
          <span className="operation-list__indicator operation-list__indicator--orange" />

          <div>
            <strong>8 pedidos em preparo</strong>
            <span>Cozinha</span>
          </div>

          <b>8</b>
        </div>

        <div>
          <span className="operation-list__indicator operation-list__indicator--green" />

          <div>
            <strong>3 pedidos prontos</strong>
            <span>Aguardando retirada</span>
          </div>

          <b>3</b>
        </div>

        <div>
          <span className="operation-list__indicator operation-list__indicator--blue" />

          <div>
            <strong>2 entregadores em rota</strong>
            <span>Entregas</span>
          </div>

          <b>2</b>
        </div>

        <div>
          <span className="operation-list__indicator operation-list__indicator--yellow" />

          <div>
            <strong>4 mesas ocupadas</strong>
            <span>Salão</span>
          </div>

          <b>4</b>
        </div>
      </div>
    </article>
  );
}