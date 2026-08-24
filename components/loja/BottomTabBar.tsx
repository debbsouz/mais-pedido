import {
  ClipboardText,
  House,
  ShoppingCart,
  Tag,
} from "@phosphor-icons/react";

export type StorefrontTab =
  | "home"
  | "orders"
  | "promos"
  | "cart";

interface BottomTabBarProps {
  active: StorefrontTab;
  cartCount: number;
  onSelect: (tab: StorefrontTab) => void;
}

const tabs: {
  id: StorefrontTab;
  label: string;
  icon: typeof House;
}[] = [
  { id: "home", label: "Início", icon: House },
  {
    id: "orders",
    label: "Pedidos",
    icon: ClipboardText,
  },
  { id: "promos", label: "Promos", icon: Tag },
  {
    id: "cart",
    label: "Carrinho",
    icon: ShoppingCart,
  },
];

export function BottomTabBar({
  active,
  cartCount,
  onSelect,
}: BottomTabBarProps) {
  return (
    <nav className="storefront__tabbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`storefront__tab${
              isActive
                ? " storefront__tab--active"
                : ""
            }`}
            onClick={() => onSelect(tab.id)}
          >
            <span className="storefront__tab-icon">
              <Icon
                size={21}
                weight={
                  isActive ? "fill" : "regular"
                }
              />

              {tab.id === "cart" &&
                cartCount > 0 && (
                  <span className="storefront__tab-badge">
                    {cartCount}
                  </span>
                )}
            </span>

            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
