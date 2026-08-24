import Link from "next/link";

export function Footer() {
  return (
    <footer className="app-footer">
      <span>+Pedido</span>

      <div className="app-footer__links">
        <Link href="/ajuda">Ajuda</Link>
        <Link href="/termos">Termos de uso</Link>
      </div>
    </footer>
  );
}
