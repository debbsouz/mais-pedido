export type PlanId =
  | "start"
  | "essencial"
  | "gestao-pro"
  | "premium";

export type FeatureId =
  | "digitalMenu"
  | "delivery"
  | "pickup"
  | "counterOrders"
  | "tableQrCode"
  | "tables"
  | "waiter"
  | "frontDesk"
  | "coupons"
  | "cashback"
  | "scheduling"
  | "deliveryDrivers"
  | "kitchenDisplay"
  | "inventory"
  | "financial"
  | "purchases"
  | "automatedInvoice"
  | "adsIntegration"
  | "customWebsite"
  | "domain"
  | "trafficManager"
  | "quarterlyConsulting"
  | "executiveReport";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  maxUsers: number | null;
  maxUnits: number | null;
  features: FeatureId[];
}

export const plans: Record<PlanId, Plan> = {
  start: {
    id: "start",
    name: "Start",
    price: 99,
    description:
      "Para pequenos estabelecimentos começarem a vender e organizar os pedidos.",
    maxUsers: 2,
    maxUnits: 1,
    features: [
      "digitalMenu",
      "delivery",
      "pickup",
      "counterOrders",
      "tableQrCode",
    ],
  },

  essencial: {
    id: "essencial",
    name: "Essencial",
    price: 250,
    description:
      "Operação completa para estabelecimentos que já possuem atendimento mais estruturado.",
    maxUsers: null,
    maxUnits: 1,
    features: [
      "digitalMenu",
      "delivery",
      "pickup",
      "counterOrders",
      "tableQrCode",
      "tables",
      "waiter",
      "frontDesk",
      "coupons",
      "cashback",
      "scheduling",
      "deliveryDrivers",
    ],
  },

  "gestao-pro": {
    id: "gestao-pro",
    name: "Gestão Pro",
    price: 350,
    description:
      "Gestão operacional e financeira completa para negócios em crescimento.",
    maxUsers: null,
    maxUnits: 1,
    features: [
      "digitalMenu",
      "delivery",
      "pickup",
      "counterOrders",
      "tableQrCode",
      "tables",
      "waiter",
      "frontDesk",
      "coupons",
      "cashback",
      "scheduling",
      "deliveryDrivers",
      "kitchenDisplay",
      "inventory",
      "financial",
      "purchases",
      "automatedInvoice",
      "adsIntegration",
    ],
  },

  premium: {
    id: "premium",
    name: "Premium",
    price: 499,
    description:
      "Sistema completo acompanhado de serviços estratégicos da Next Code.",
    maxUsers: null,
    maxUnits: 1,
    features: [
      "digitalMenu",
      "delivery",
      "pickup",
      "counterOrders",
      "tableQrCode",
      "tables",
      "waiter",
      "frontDesk",
      "coupons",
      "cashback",
      "scheduling",
      "deliveryDrivers",
      "kitchenDisplay",
      "inventory",
      "financial",
      "purchases",
      "automatedInvoice",
      "adsIntegration",
      "customWebsite",
      "domain",
      "trafficManager",
      "quarterlyConsulting",
      "executiveReport",
    ],
  },
};

export const featureLabels: Record<
  FeatureId,
  string
> = {
  digitalMenu: "Cardápio digital",
  delivery: "Delivery",
  pickup: "Retirada",
  counterOrders: "Pedidos no balcão",
  tableQrCode: "QR Code para mesas",
  tables: "Gestão de mesas",
  waiter: "Garçom",
  frontDesk: "Frente de caixa",
  coupons: "Cupons",
  cashback: "Cashback",
  scheduling: "Agendamentos",
  deliveryDrivers: "Cadastro de entregadores",
  kitchenDisplay: "Display da cozinha",
  inventory: "Gestão de estoque",
  financial: "Gestão financeira",
  purchases: "Registro de compras",
  automatedInvoice: "Nota fiscal automatizada",
  adsIntegration: "Integração com anúncios",
  customWebsite: "Site personalizado",
  domain: "Domínio",
  trafficManager: "Gestor de tráfego",
  quarterlyConsulting: "Consultoria trimestral",
  executiveReport: "Relatório executivo mensal",
};

export function planHasFeature(
  planId: PlanId,
  feature: FeatureId,
) {
  return plans[planId].features.includes(feature);
}