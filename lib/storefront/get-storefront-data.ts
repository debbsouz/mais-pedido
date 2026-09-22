import { getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { isWithinBusinessHours } from "./business-hours";
import type { StorefrontData } from "./types";

function buildWhatsAppUrl(
  phone: string | null,
): string | undefined {
  if (!phone) {
    return undefined;
  }

  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return undefined;
  }

  const withCountryCode =
    digits.length <= 11 ? `55${digits}` : digits;

  return `https://wa.me/${withCountryCode}`;
}

/**
 * Ponto único de acesso aos dados da loja pública.
 *
 * Busca organização, categorias e produtos reais do Supabase, sem
 * exigir sessão (RLS pública liberada na migration
 * 20260825_014_loja_publica_leitura_e_pedido.sql).
 *
 * Campos que ainda não têm coluna real no banco (cor da marca,
 * avaliação, promoções, populares, pedidos recentes) usam um valor
 * neutro/vazio — nunca um número inventado. Logo e banner já são
 * reais (organizations.logo_url/banner_url, editados em
 * Configurações → Identidade Visual). Os
 * componentes que consomem esses campos já somem sozinhos quando
 * vêm vazios (promoções, destaques, "peça de novo"), e a avaliação
 * só aparece quando reviewCount > 0. Status aberto/fechado, pedido
 * mínimo, redes sociais e bandeiras de cartão aceitas já são reais
 * (ver app/actions/store-settings.ts). O status "aberto" combina o
 * interruptor manual com o horário de funcionamento programado
 * (app/actions/business-hours.ts, isWithinBusinessHours) — se não
 * houver horário configurado, vale só o interruptor manual, igual
 * antes. O tempo estimado de entrega (delivery_time_min/max_minutes)
 * é opcional e configurado por cada empresa em Configurações →
 * Cardápio Digital — quando nenhum dos dois está preenchido, a loja
 * pública simplesmente não mostra nada (nunca um tempo inventado).
 * O WhatsApp não tem campo
 * próprio — é derivado do telefone cadastrado em Estabelecimento
 * (buildWhatsAppUrl). Ver docs/LOJA_PUBLICA_BACKEND.md, seção 4,
 * para o que ainda falta.
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

  const [{ data: categoryRows }, { data: productRows }, { data: hourRows }] =
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
      supabase
        .from("business_hours")
        .select("day_of_week, is_closed, opens_at, closes_at")
        .eq("organization_id", org.id),
    ]);

  const businessHours = (hourRows ?? []).map(
    (row: Record<string, unknown>) => ({
      dayOfWeek: row.day_of_week as number,
      isClosed: row.is_closed as boolean,
      opensAt: (row.opens_at as string | null)?.slice(0, 5) ?? null,
      closesAt: (row.closes_at as string | null)?.slice(0, 5) ?? null,
    }),
  );

  const withinSchedule = isWithinBusinessHours(businessHours);
  const manualIsOpen = org.is_open as boolean;
  const effectiveIsOpen =
    manualIsOpen && (withinSchedule === null || withinSchedule);

  const categoryNames = (categoryRows ?? []).map(
    (category) => category.name as string,
  );

  const acceptedCardBrands =
    (org.accepted_card_brands as string[] | null) ?? [];

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
    tracking: {
      metaPixelId:
        (org.meta_pixel_id as string | null) ?? undefined,
      googleAdsId:
        (org.google_ads_id as string | null) ?? undefined,
    },
    brand: {
      name: org.name as string,
      type: "Estabelecimento",
      description: "",
      logoUrl: (org.logo_url as string | null) ?? null,
      bannerUrl: (org.banner_url as string | null) ?? null,
      initials: getInitials(org.name as string),
      theme: {
        primary: "#ea580c",
        secondary: "#7c2d12",
      },
      rating: 0,
      reviewCount: 0,
    },
    status: {
      isOpen: effectiveIsOpen,
      minOrder: (org.min_order_cents as number) / 100,
      deliveryTimeMinMinutes:
        (org.delivery_time_min_minutes as number | null) ??
        null,
      deliveryTimeMaxMinutes:
        (org.delivery_time_max_minutes as number | null) ??
        null,
    },
    social: {
      instagram:
        (org.instagram_url as string | null) ?? undefined,
      whatsapp: buildWhatsAppUrl(
        org.phone as string | null,
      ),
    },
    categories: ["Todos", ...categoryNames],
    products,
    promos: [],
    popularProductIds: [],
    recentOrders: [],
    acceptedCardBrands,
    paymentMethods: [
      {
        id: "pix",
        label: "Pix",
        description: "Pagamento instantâneo",
      },
      {
        id: "card",
        label: "Cartão",
        description:
          acceptedCardBrands.length > 0
            ? `Crédito ou débito na entrega — aceitamos ${acceptedCardBrands.join(", ")}`
            : "Crédito ou débito na entrega",
      },
      {
        id: "cash",
        label: "Dinheiro",
        description: "Pagamento na entrega",
      },
    ],
  };
}
