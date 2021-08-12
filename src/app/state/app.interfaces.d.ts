interface App {
  // define state here
  coffeeMenu: Coffee[];
  cart: { name: string; quantity: number }[];
}

interface AppApp {
  readonly app: App;
}

interface Coffee {
  name: string;
  price: number;
  recipe: RecipeItem[];
}

interface RecipeItem {
  name: string;
  quantity: number;
}
