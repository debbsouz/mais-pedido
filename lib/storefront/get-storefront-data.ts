import { createClient } from "@/lib/supabase/server";

import type { StorefrontData } from "./types";

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Ponto único de acesso aos dados da loja pública.
 *
 * Busca organização, categorias e produtos reais do Supabase, sem
 * exigir sessão (RLS pública liberada na migration
 * 20260825_014_loja_publica_leitura_e_pedido.sql).
 *
 * Campos que ainda não têm coluna real no banco (cor da marca,
 * logo/banner, avaliação, promoções, populares, pedidos recentes,
 * formas de pagamento configuráveis) usam um valor neutro/vazio —
 * nunca um número inventado. Os componentes que consomem esses
 * campos já somem sozinhos quando vêm vazios (promoções,
 * destaques, "peça de novo", redes sociais), e a avaliação só
 * aparece quando reviewCount > 0. Status aberto/fechado, pedido
 * mínimo e redes sociais já são reais (ver
 * app/actions/store-settings.ts). Ver docs/LOJA_PUBLICA_BACKEND.md,
 * seção 4, para o que ainda falta.
 */
export async function getStorefrontData(
  slug: string,
): Promise<StorefrontData | null> {
  const supabase = await createClient();

  const { data: orgRows } = await supabase.rpc(
    "get_public_organization_by_slug",
    { org_slug: slug },
  );

  const org = orgRows?.[0];

  if (!org) {
    return null;
  }

  const [{ data: categoryRows }, { data: productRows }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, sort_order")
        .eq("organization_id", org.id)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select(
          "id, name, description, price, image_url, is_available, sort_order, categories(name)",
        )
        .eq("organization_id", org.id)
        .eq("is_available", true)
        .order("sort_order", { ascending: true }),
    ]);

  const categoryNames = (categoryRows ?? []).map(
    (category) => category.name as string,
  );

  const products = (productRows ?? []).map(
    (product: Record<string, unknown>) => ({
      id: product.id as string,
      name: product.name as string,
      description: (product.description as string) ?? "",
      category:
        (product.categories as { name: string } | null)
          ?.name ?? "Sem categoria",
      price: (product.price as number) / 100,
      image: (product.image_url as string) ?? null,
      available: product.is_available as boolean,
    }),
  );

  return {
    organizationId: org.id as string,
    slug: org.slug as string,
    brand: {
      name: org.name as string,
      type: "Estabelecimento",
      description: "",
      logoUrl: null,
      bannerUrl: null,
      initials: getInitials(org.name as string),
      theme: {
        primary: "#ea580c",
        secondary: "#7c2d12",
      },
      rating: 0,
      reviewCount: 0,
    },
    status: {
      isOpen: org.is_open as boolean,
      minOrder: (org.min_order_cents as number) / 100,
    },
    social: {
      instagram:
        (org.instagram_url as string | null) ?? undefined,
      facebook:
        (org.facebook_url as string | null) ?? undefined,
      whatsapp:
        (org.whatsapp_url as string | null) ?? undefined,
    },
    categories: ["Todos", ...categoryNames],
    products,
    promos: [],
    popularProductIds: [],
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
}
