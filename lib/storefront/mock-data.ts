/**
 * MOCK — dados de exemplo da loja "Burger House".
 *
 * Nada aqui vem do Supabase. Serve só para avaliar visualmente a
 * experiência da loja pública antes do backend liberar leitura
 * pública por slug (RLS, org por slug, storage de imagens etc.).
 *
 * Ver lib/storefront/get-storefront-data.ts para o ponto único de
 * troca quando o backend estiver pronto.
 */

import type { StorefrontData } from "./types";

const burgerHouse: StorefrontData = {
  slug: "burger-house",
  brand: {
    name: "Burger House",
    type: "Hamburgueria",
    description:
      "Hambúrgueres artesanais feitos na hora, com pão brioche e carne 100% bovina.",
    logoUrl: null,
    bannerUrl: null,
    initials: "BH",
    theme: {
      primary: "#ea580c",
      secondary: "#7c2d12",
    },
    rating: 4.8,
    reviewCount: 230,
  },
  status: {
    isOpen: true,
    minOrder: 15,
  },
  social: {
    instagram: "https://instagram.com/burgerhouse",
    facebook: "https://facebook.com/burgerhouse",
    whatsapp: "https://wa.me/5511999999999",
  },
  categories: [
    "Todos",
    "Hambúrgueres",
    "Pizzas",
    "Bebidas",
    "Porções",
    "Sobremesas",
  ],
  products: [
    {
      id: "burger-01",
      name: "X-Burger",
      description: "Pão, carne, queijo e molho especial",
      category: "Hambúrgueres",
      price: 22,
      image: null,
      available: true,
    },
    {
      id: "burger-02",
      name: "X-Bacon",
      description: "Carne, queijo, bacon e molho da casa",
      category: "Hambúrgueres",
      price: 28,
      promoPrice: 23.9,
      image: null,
      available: true,
    },
    {
      id: "burger-03",
      name: "X-Salada",
      description: "Carne, queijo, salada e maionese",
      category: "Hambúrgueres",
      price: 25,
      image: null,
      available: true,
    },
    {
      id: "pizza-01",
      name: "Pizza Calabresa",
      description: "Calabresa, cebola e queijo",
      category: "Pizzas",
      price: 54.9,
      promoPrice: 44.9,
      image: null,
      available: true,
    },
    {
      id: "pizza-02",
      name: "Pizza Frango",
      description: "Frango, requeijão e queijo",
      category: "Pizzas",
      price: 59.9,
      image: null,
      available: false,
    },
    {
      id: "drink-01",
      name: "Coca-Cola 2L",
      description: "Refrigerante Coca-Cola de 2 litros",
      category: "Bebidas",
      price: 15,
      image: null,
      available: true,
    },
    {
      id: "drink-02",
      name: "Suco de Laranja",
      description: "Suco natural de laranja, 500 ml",
      category: "Bebidas",
      price: 12,
      image: null,
      available: true,
    },
    {
      id: "portion-01",
      name: "Batata Grande",
      description: "Porção grande de batata frita",
      category: "Porções",
      price: 24.9,
      image: null,
      available: true,
    },
    {
      id: "portion-02",
      name: "Anéis de Cebola",
      description: "Porção crocante com molho especial",
      category: "Porções",
      price: 26,
      image: null,
      available: true,
    },
    {
      id: "dessert-01",
      name: "Brownie",
      description: "Brownie de chocolate com cobertura",
      category: "Sobremesas",
      price: 14,
      image: null,
      available: true,
    },
  ],
  promos: [
    {
      id: "promo-01",
      kind: "coupon",
      title: "15% OFF no primeiro pedido",
      subtitle: "Use o cupom BEMVINDO no carrinho",
    },
    {
      id: "promo-02",
      kind: "free-delivery",
      title: "Entrega grátis",
      subtitle: "Em pedidos acima de R$ 50",
    },
    {
      id: "promo-03",
      kind: "combo",
      title: "Combo do dia",
      subtitle: "2 X-Bacon + batata grande por R$ 69,90",
    },
  ],
  popularProductIds: ["burger-02", "pizza-01", "portion-01"],
  // Vazio de propósito: só deve ganhar itens quando existir
  // histórico real de pedidos do cliente autenticado.
  recentOrders: [],
  paymentMethods: [
    {
      id: "pix",
      label: "Pix",
      description: "Pagamento instantâneo",
    },
    {
      id: "card",
      label: "Cartão",
      description: "Crédito ou débito na entrega",
    },
    {
      id: "cash",
      label: "Dinheiro",
      description: "Pagamento na entrega",
    },
  ],
};

const mockStores: Record<string, StorefrontData> = {
  "burger-house": burgerHouse,
};

export function getMockStorefront(
  slug: string,
): StorefrontData | null {
  return mockStores[slug] ?? null;
}
