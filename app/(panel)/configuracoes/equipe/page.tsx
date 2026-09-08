"use client";

import { type FormEvent, useEffect, useState } from "react";

import { Trash, UserPlus } from "@phosphor-icons/react";

import {
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
  type TeamMember,
} from "@/app/actions/team";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";
import { roles, type UserRole } from "@/lib/roles";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "kitchen", label: "Cozinha" },
  { value: "waiter", label: "Garçom" },
  { value: "attendant", label: "Atendente" },
  { value: "delivery", label: "Entregador" },
  { value: "manager", label: "Gerente" },
];

export default function EquipePage() {
  const [members, setMembers] = useState<
    TeamMember[] | null
  >(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("kitchen");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    string | null
  >(null);
  const [removingId, setRemovingId] = useState<
    string | null
  >(null);

  useEffect(() => {
    void getTeamMembers().then(setMembers);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setIsSaving(true);
    setSaveMessage(null);

    const result = await addTeamMember({
      email,
      fullName: name,
      role,
    });

    setIsSaving(false);

    if (result.success) {
      setName("");
      setEmail("");
      setRole("kitchen");
      setSaveMessage(
        "Convite enviado! A pessoa já aparece na equipe.",
      );
      void getTeamMembers().then(setMembers);
      return;
    }

    setSaveMessage(result.error);
  }

  async function handleRemove(memberId: string) {
    setRemovingId(memberId);

    const result = await removeTeamMember(memberId);

    setRemovingId(null);

    if (result.success) {
      void getTeamMembers().then(setMembers);
    }
  }

  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>Equipe</h2>
          <p>
            Contas de acesso para cozinha, garçom, atendente e
            entregador.
          </p>
        </div>

        <SettingsHelp>
          <p>
            Preencha nome, e-mail e cargo da pessoa. A gente manda
            um e-mail de convite pra ela criar a própria senha — a
            pessoa passa a ter acesso só às telas do próprio cargo.
          </p>
        </SettingsHelp>
      </div>

      <div className="settings-card">
        <div className="settings-card__header">
          <h2>Time atual</h2>
        </div>

        {members === null && (
          <p className="settings-form__note">Carregando...</p>
        )}

        {members?.length === 0 && (
          <p className="settings-form__note">
            Só você por enquanto.
          </p>
        )}

        {members && members.length > 0 && (
          <ul className="team-list">
            {members.map((member) => (
              <li key={member.id}>
                <div>
                  <strong>{member.name}</strong>
                  <span>{roles[member.role].name}</span>
                </div>

                {member.role !== "owner" && (
                  <button
                    type="button"
                    aria-label={`Remover ${member.name}`}
                    disabled={removingId === member.id}
                    onClick={() =>
                      handleRemove(member.id)
                    }
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="settings-card">
        <div className="settings-card__header">
          <UserPlus size={18} weight="bold" />
          <h2>Adicionar funcionário</h2>
        </div>

        <p className="settings-team__instructions">
          Preencha os dados e clique em adicionar. A pessoa recebe
          um e-mail de convite e cria a própria senha — não precisa
          de mais nenhum passo manual.
        </p>

        <form
          className="settings-form settings-form--grid"
          onSubmit={handleSubmit}
        >
          <div className="settings-form__field">
            <span>Nome completo</span>
            <input
              type="text"
              placeholder="Ex: Ana Souza"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field">
            <span>E-mail</span>
            <input
              type="email"
              placeholder="ana@empresa.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="settings-form__field">
            <span>Cargo</span>
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as UserRole)
              }
            >
              {roleOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-form__field settings-form__field--full">
            <button
              type="submit"
              className="settings-form__submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Adicionando..."
                : "Adicionar funcionário"}
            </button>

            {saveMessage && (
              <small className="settings-form__note">
                {saveMessage}
              </small>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
