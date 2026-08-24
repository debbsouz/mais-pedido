"use client";

import { useCurrentUser } from "@/components/providers/AuthProvider";
import { roles } from "@/lib/roles";
import { getInitials } from "@/lib/user-display";

export default function PerfilPage() {
  const currentUser = useCurrentUser();
  const currentRole =
    roles[currentUser.role];

  return (
    <section className="profile-page">
      <header className="profile-page__header">
        <span>Sua conta</span>
        <h1>Meu perfil</h1>
        <p>
          Informações da sua conta neste
          painel.
        </p>
      </header>

      <article className="profile-card">
        <div className="profile-card__avatar">
          {getInitials(currentUser.name)}
        </div>

        <div>
          <strong>
            {currentUser.name}
          </strong>
          <span>{currentRole.name}</span>
        </div>
      </article>
    </section>
  );
}
