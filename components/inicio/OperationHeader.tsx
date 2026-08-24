"use client";

import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/components/providers/AuthProvider";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function OperationHeader() {
  const router = useRouter();
  const currentUser = useCurrentUser();

  return (
    <section className="dashboard__heading">
      <div>
        <span className="dashboard__eyebrow">
          Central de operações
        </span>

        <h1>
          {getGreeting()},{" "}
          {getFirstName(currentUser.name)}!
        </h1>

        <p>
          Veja o que está acontecendo agora na Burger House.
        </p>
      </div>

      <button
        type="button"
        className="dashboard__primary-action"
        onClick={() => router.push("/pedidos")}
      >
        <span>+</span>
        Novo pedido
      </button>
    </section>
  );
}
