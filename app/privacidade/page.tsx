import Image from "next/image";
import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <section className="legal-page legal-page--standalone">
      <Link href="/" className="legal-page__brand">
        <Image
          src="/logo-mais-pedido.png"
          alt="+Pedido"
          width={140}
          height={44}
        />
      </Link>

      <header className="legal-page__header">
        <span>Jurídico</span>
        <h1>Política de privacidade</h1>
      </header>

      <p className="legal-page__updated">
        Última atualização: setembro de 2026.
      </p>

      <article className="legal-page__content">
        <div className="legal-page__section">
          <h2>1. Quem somos</h2>
          <p>
            O +Pedido é um sistema de gestão para
            restaurantes, desenvolvido e operado pela Next
            Code. Esta política explica quais dados
            coletamos, por quê, e quais são os seus direitos
            — tanto se você faz parte da equipe de um
            estabelecimento que usa o +Pedido, quanto se é
            um cliente final fazendo um pedido pela loja
            digital de um desses estabelecimentos.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>2. Dados que coletamos</h2>
          <p>
            <strong>
              De quem faz pedido pela loja digital (cliente
              final):
            </strong>
          </p>
          <ul>
            <li>Nome e telefone/WhatsApp;</li>
            <li>
              Endereço de entrega, quando o pedido é por
              delivery;
            </li>
            <li>
              Itens pedidos, forma de pagamento escolhida e
              histórico de pedidos naquele estabelecimento.
            </li>
          </ul>

          <p>
            <strong>
              De quem trabalha num estabelecimento que usa o
              +Pedido (equipe):
            </strong>
          </p>
          <ul>
            <li>Nome, e-mail e cargo;</li>
            <li>
              Registros de uso do sistema (pedidos criados,
              alterações feitas) para o funcionamento normal
              da operação.
            </li>
          </ul>
        </div>

        <div className="legal-page__section">
          <h2>3. Para que usamos esses dados</h2>
          <ul>
            <li>Processar e acompanhar pedidos;</li>
            <li>
              Identificar um cliente que já pediu antes, para
              agilizar um novo pedido e aplicar benefícios
              como cashback e cupons, quando o estabelecimento
              oferece;
            </li>
            <li>
              Dar acesso ao sistema para cada pessoa da
              equipe, de acordo com seu cargo;
            </li>
            <li>
              Cumprir obrigações legais e responder a
              solicitações de autoridades, quando aplicável.
            </li>
          </ul>
          <p>
            Não vendemos dados pessoais para terceiros.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>4. Com quem compartilhamos</h2>
          <p>
            Os dados de um pedido feito na loja digital de um
            estabelecimento ficam visíveis para a equipe
            <em> daquele</em> estabelecimento — nunca para
            outros estabelecimentos cadastrados no +Pedido.
            Usamos provedores de infraestrutura (hospedagem e
            banco de dados) para operar o sistema, que têm
            acesso técnico aos dados apenas na medida
            necessária para prestar esse serviço.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>5. Por quanto tempo guardamos</h2>
          <p>
            Mantemos os dados enquanto sua conta (ou a conta
            do estabelecimento onde você fez um pedido)
            estiver ativa, ou pelo tempo necessário para
            cumprir obrigações legais e fiscais. Você pode
            solicitar a exclusão dos seus dados a qualquer
            momento — veja a seção 7.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>6. Cookies e armazenamento local</h2>
          <p>
            Usamos armazenamento local do navegador (não
            cookies de rastreamento de terceiros) para
            lembrar preferências como tema claro/escuro e
            manter você conectado entre visitas. Se o
            estabelecimento configurar integração com Meta
            Pixel ou Google Ads, esses serviços podem coletar
            dados de navegação na loja pública conforme as
            próprias políticas deles.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>7. Seus direitos (LGPD)</h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018), você pode solicitar, a
            qualquer momento:
          </p>
          <ul>
            <li>Confirmação de que tratamos seus dados;</li>
            <li>Acesso aos dados que temos sobre você;</li>
            <li>Correção de dados incompletos ou incorretos;</li>
            <li>
              Exclusão dos seus dados, quando não houver
              obrigação legal de mantê-los;
            </li>
            <li>
              Informação sobre com quem compartilhamos seus
              dados.
            </li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, envie
            um e-mail para{" "}
            <a href="mailto:contato@maispedido.com.br">
              contato@maispedido.com.br
            </a>
            .
          </p>
        </div>

        <div className="legal-page__section">
          <h2>8. Segurança</h2>
          <p>
            Adotamos medidas técnicas para proteger os dados
            armazenados, incluindo controle de acesso por
            organização (cada estabelecimento só enxerga os
            próprios dados) e conexões criptografadas. Nenhum
            sistema é 100% livre de risco, mas trabalhamos
            continuamente para manter a proteção adequada.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>9. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente.
            A data no topo desta página sempre indica a
            versão mais recente.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>10. Contato</h2>
          <p>
            Dúvidas sobre esta política ou sobre seus dados
            podem ser enviadas para{" "}
            <a href="mailto:contato@maispedido.com.br">
              contato@maispedido.com.br
            </a>
            . Veja também os{" "}
            <Link href="/termos">Termos de Uso</Link>.
          </p>
        </div>
      </article>
    </section>
  );
}
