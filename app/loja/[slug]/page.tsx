import { StorefrontExperience } from "@/components/loja/StorefrontExperience";
import { getStorefrontData } from "@/lib/storefront/get-storefront-data";

interface LojaPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string }>;
}

export default async function LojaPage({
  params,
  searchParams,
}: LojaPageProps) {
  const { slug } = await params;
  const { mesa } = await searchParams;

  const data = await getStorefrontData(slug);

  if (!data) {
    return (
      <div className="storefront storefront--not-found">
        <div className="storefront__not-found">
          <strong>Loja não encontrada</strong>
          <p>Verifique o link ou tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <StorefrontExperience
      data={data}
      tableNumber={mesa ?? null}
    />
  );
}
