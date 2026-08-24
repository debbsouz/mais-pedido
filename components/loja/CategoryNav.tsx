interface CategoryNavProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

// A cor de destaque usada na categoria ativa vem da variável
// --store-brand, definida no elemento raiz da loja (ver
// StorefrontExperience), então cada estabelecimento usa a
// própria cor sem precisar de CSS extra por loja.

export function CategoryNav({
  categories,
  active,
  onSelect,
}: CategoryNavProps) {
  return (
    <nav className="storefront__categories">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`storefront__category-pill${
            active === category
              ? " storefront__category-pill--active"
              : ""
          }`}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
