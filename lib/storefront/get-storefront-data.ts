import { getMockStorefront } from "./mock-data";
import type { StorefrontData } from "./types";

/**
 * Ponto único de acesso aos dados da loja pública.
 *
 * Hoje devolve o mock local. Quando o backend liberar leitura
 * pública por slug (organização + unidade + catálogo via RLS),
 * troca-se apenas o corpo desta função por uma chamada ao
 * Supabase — nenhum componente de components/loja/ precisa mudar,
 * pois todos dependem só do contrato em lib/storefront/types.ts.
 */
export async function getStorefrontData(
  slug: string,
): Promise<StorefrontData | null> {
  return getMockStorefront(slug);
}
