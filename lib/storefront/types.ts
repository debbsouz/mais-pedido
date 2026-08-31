/**
 * Contrato de dados da loja pública (/loja/[slug]).
 *
 * Este tipo já imita o formato que o Supabase deverá devolver
 * quando o backend liberar leitura pública por slug. Componentes
 * de components/loja/ dependem SOMENTE deste contrato — nunca de
 * mocks diretamente — para que a troca do mock pelo backend real
 * não exija redesenhar nada.
 */

export interface StorefrontTheme {
  primary: string;
  secondary: string;
}

export interface StorefrontBrand {
  name: string;
  type: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  initials: string;
  theme: StorefrontTheme;
  rating: number;
  reviewCount: number;
}

export interface StorefrontStatus {
  isOpen: boolean;
  minOrder: number;
}

export interface StorefrontSocial {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}

export type StorefrontPromoKind =
  | "discount"
  | "free-delivery"
  | "coupon"
  | "combo"
  | "notice"
  | "custom";

export interface StorefrontPromo {
  id: string;
  kind: StorefrontPromoKind;
  title: string;
  subtitle: string;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  promoPrice?: number;
  image: string | null;
  available: boolean;
}

export type StorefrontPaymentMethodId = "pix" | "card" | "cash";

export interface StorefrontPaymentMethod {
  id: StorefrontPaymentMethodId;
  label: string;
  description: string;
}

export interface StorefrontRecentOrderItem {
  id: string;
  name: string;
  detail: string;
}

export interface StorefrontData {
  organizationId: string;
  slug: string;
  brand: StorefrontBrand;
  status: StorefrontStatus;
  social: StorefrontSocial;
  categories: string[];
  products: StorefrontProduct[];
  promos: StorefrontPromo[];
  popularProductIds: string[];
  recentOrders: StorefrontRecentOrderItem[];
  paymentMethods: StorefrontPaymentMethod[];
}

export type OrderFulfillment = "delivery" | "pickup" | "dine-in";

export type OrderStatusStep =
  | "received"
  | "accepted"
  | "preparing"
  | "out-for-delivery"
  | "ready"
  | "delivered";
