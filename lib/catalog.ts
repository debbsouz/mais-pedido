export type ProductCategory =
  | "Hambúrgueres"
  | "Pizzas"
  | "Bebidas"
  | "Porções"
  | "Sobremesas";

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  image: string;
}

export const catalogCategories = [
  "Todos",
  "Hambúrgueres",
  "Pizzas",
  "Bebidas",
  "Porções",
  "Sobremesas",
] as const;

export type CatalogCategory =
  (typeof catalogCategories)[number];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "burger-01",
    name: "X-Burger",
    description:
      "Pão, carne, queijo e molho especial",
    category: "Hambúrgueres",
    price: 22,
    image: "🍔",
  },
  {
    id: "burger-02",
    name: "X-Bacon",
    description:
      "Carne, queijo, bacon e molho da casa",
    category: "Hambúrgueres",
    price: 28,
    image: "🥓",
  },
  {
    id: "burger-03",
    name: "X-Salada",
    description:
      "Carne, queijo, salada e maionese",
    category: "Hambúrgueres",
    price: 25,
    image: "🥪",
  },
  {
    id: "pizza-01",
    name: "Pizza Calabresa",
    description:
      "Calabresa, cebola e queijo",
    category: "Pizzas",
    price: 54.9,
    image: "🍕",
  },
  {
    id: "pizza-02",
    name: "Pizza Frango",
    description:
      "Frango, requeijão e queijo",
    category: "Pizzas",
    price: 59.9,
    image: "🍕",
  },
  {
    id: "drink-01",
    name: "Coca-Cola 2L",
    description:
      "Refrigerante Coca-Cola de 2 litros",
    category: "Bebidas",
    price: 15,
    image: "🥤",
  },
  {
    id: "drink-02",
    name: "Suco de Laranja",
    description:
      "Suco natural de laranja, 500 ml",
    category: "Bebidas",
    price: 12,
    image: "🍊",
  },
  {
    id: "portion-01",
    name: "Batata Grande",
    description:
      "Porção grande de batata frita",
    category: "Porções",
    price: 24.9,
    image: "🍟",
  },
  {
    id: "portion-02",
    name: "Anéis de Cebola",
    description:
      "Porção crocante com molho especial",
    category: "Porções",
    price: 26,
    image: "🧅",
  },
  {
    id: "dessert-01",
    name: "Brownie",
    description:
      "Brownie de chocolate com cobertura",
    category: "Sobremesas",
    price: 14,
    image: "🍫",
  },
];