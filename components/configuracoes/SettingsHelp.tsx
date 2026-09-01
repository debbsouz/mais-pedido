"use client";

import { Question } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";

interface SettingsHelpProps {
  children: ReactNode;
}

/**
 * Botão de ajuda contextual, leve (só CSS/estado local, sem
 * biblioteca nova) — explica o que a página faz quando clicado.
 */
export function SettingsHelp({
  children,
}: SettingsHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="settings-help">
      <button
        type="button"
        className="settings-help__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Question
          size={15}
          weight="bold"
        />
        Ajuda
      </button>

      {open && (
        <div className="settings-help__panel">
          {children}
        </div>
      )}
    </div>
  );
}
