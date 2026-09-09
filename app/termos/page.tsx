import Image from "next/image";
import Link from "next/link";

export default function TermosPage() {
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
        <h1>Termos de uso</h1>
      </header>

      <p className="legal-page__updated">
        Última atualização: setembro de 2026.
      </p>

      <article className="legal-page__content">
        <div className="legal-page__section">
          <h2>1. Quem somos</h2>
          <p>
            O +Pedido é um sistema de gestão para
            restaurantes e estabelecimentos alimentícios,
            desenvolvido e operado pela Next Code. Estes
            termos regem o uso do painel de gestão pela sua
            empresa e pela sua equipe (proprietário,
            gerente, atendente, garçom, cozinha e
            entregador).
          </p>
        </div>

        <div className="legal-page__section">
          <h2>2. Aceite</h2>
          <p>
            Ao criar uma conta ou fazer login no +Pedido,
            você concorda com estes Termos de Uso e com a{" "}
            <Link href="/privacidade">
              Política de Privacidade
            </Link>
            . Se você está usando o sistema em nome de uma
            empresa, declara ter poderes para aceitar estes
            termos em nome dela.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>3. O que o +Pedido oferece</h2>
          <p>
            Gestão de cardápio, pedidos (delivery, retirada,
            balcão e mesa), cozinha, entregas, mesas, equipe,
            clientes, financeiro, relatórios e uma loja
            digital pública para os clientes do seu
            estabelecimento fazerem pedidos. Os recursos
            disponíveis variam de acordo com o plano
            contratado.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>4. Cadastro e responsabilidade da conta</h2>
          <p>
            O cadastro da empresa e do dono da conta é feito
            pela Next Code no momento da contratação. A
            partir daí, o proprietário é responsável por
            convidar e gerenciar sua própria equipe, e por
            manter as credenciais de acesso (e-mail e senha)
            de cada pessoa em sigilo. Você é responsável por
            tudo que acontece na sua conta, incluindo ações
            de funcionários que você cadastrar.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>5. Planos e cobrança</h2>
          <p>
            O acesso ao +Pedido é fornecido mediante
            assinatura de um plano mensal, conforme
            combinado no momento da contratação. O
            cancelamento, upgrade ou downgrade de plano deve
            ser solicitado diretamente à Next Code.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>6. Uso aceitável</h2>
          <p>Ao usar o +Pedido, você concorda em não:</p>
          <ul>
            <li>
              Usar o sistema para fins ilegais ou fraudulentos;
            </li>
            <li>
              Tentar acessar dados de outras empresas
              cadastradas no sistema;
            </li>
            <li>
              Tentar burlar, sobrecarregar ou comprometer a
              segurança da plataforma;
            </li>
            <li>
              Usar a loja pública para divulgar conteúdo
              ofensivo, ilegal ou que viole direitos de
              terceiros.
            </li>
          </ul>
        </div>

        <div className="legal-page__section">
          <h2>7. Seus dados e da sua equipe</h2>
          <p>
            Os dados que você cadastra (produtos, pedidos,
            clientes, equipe, financeiro) pertencem à sua
            empresa. A Next Code trata esses dados como
            confidenciais e os utiliza apenas para operar o
            serviço, conforme detalhado na{" "}
            <Link href="/privacidade">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>

        <div className="legal-page__section">
          <h2>8. Disponibilidade do serviço</h2>
          <p>
            Fazemos o possível para manter o +Pedido
            disponível e funcionando corretamente, mas não
            garantimos operação ininterrupta. Manutenções
            programadas, falhas de provedores externos
            (hospedagem, banco de dados) ou problemas de
            conexão do próprio estabelecimento podem causar
            indisponibilidade temporária.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>9. Alterações nestes termos</h2>
          <p>
            Podemos atualizar estes termos periodicamente.
            Mudanças relevantes serão comunicadas pelos
            canais de contato cadastrados. O uso continuado
            do sistema após uma atualização representa
            aceite dos novos termos.
          </p>
        </div>

        <div className="legal-page__section">
          <h2>10. Contato</h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas
            para{" "}
            <a href="mailto:contato@maispedido.com.br">
              contato@maispedido.com.br
            </a>
            .
          </p>
        </div>
      </article>
    </section>
  );
}
