export type AddonId =
  | "whatsapp-ai"
  | "audio-ai"
  | "advanced-ai";

export interface Addon {
  id: AddonId;
  name: string;
  description: string;
  active: boolean;
}

export const addons: Record<AddonId, Addon> = {
  "whatsapp-ai": {
    id: "whatsapp-ai",
    name: "IA para WhatsApp",
    description:
      "Automação de atendimento e respostas no WhatsApp.",
    active: false,
  },

  "audio-ai": {
    id: "audio-ai",
    name: "IA para áudios",
    description:
      "Interpretação e resposta automática de mensagens de áudio.",
    active: false,
  },

  "advanced-ai": {
    id: "advanced-ai",
    name: "Automações avançadas com IA",
    description:
      "Recursos adicionais de inteligência artificial contratados separadamente.",
    active: false,
  },
};