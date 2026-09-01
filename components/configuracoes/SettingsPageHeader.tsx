import { ArrowLeft, type Icon } from "@phosphor-icons/react";
import Link from "next/link";

interface SettingsPageHeaderProps {
  icon: Icon;
  title: string;
  description: string;
}

export function SettingsPageHeader({
  icon: Icon,
  title,
  description,
}: SettingsPageHeaderProps) {
  return (
    <header className="settings-page__header">
      <Link
        href="/configuracoes"
        className="settings-page__back"
      >
        <ArrowLeft
          size={16}
          weight="bold"
        />
        Configurações
      </Link>

      <div className="settings-page__title">
        <span className="settings-page__title-icon">
          <Icon
            size={22}
            weight="bold"
          />
        </span>
        <h1>{title}</h1>
      </div>

      <p>{description}</p>
    </header>
  );
}
