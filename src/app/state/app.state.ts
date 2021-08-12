import { State, Action, StateContext, Selector } from "@ngxs/store";

import { mergeMap, catchError, take, tap } from "rxjs/operators";
import { of } from "rxjs";

import {
  GetCoffeeMenuSuccess,
  GetCoffeeMenuFailed,
  AddToCart,
  RemoveCartItem,
  RemoveOneCartItem,
  EmptyCart,
  AddToCoffeeMenu,
  GetCoffeeMenu,
  DummySetState,
  AddOneCartItem,
} from "./app.actions";

import { CoffeeService } from "../services/coffee.service";

export const getAppInitialState = (): App => ({
  coffeeMenu: [],
  cart: [],
});

@State<App>({
  name: "app",
  defaults: getAppInitialState(),
})
export class AppState {
  constructor(private coffeeSvc: CoffeeService) {}

  @Selector()
  static coffeeMenu(state: App) {
    return state.coffeeMenu;
  }

  @Selector()
  static totalCartAmount(state: App) {
    const priceList = state.cart.map((c) => {
      const unitPrice = state.coffeeMenu.find((x) => x.name === c.name).price;
      return unitPrice * c.quantity;
    });
    const sum = priceList.reduce((acc, curr) => acc + curr, 0);

    return sum;
  }

  @Selector()
  static totalCartQuantity(state: App) {
    const total = state.cart.reduce((acc, curr) => acc + curr.quantity, 0);

    return total;
  }

  @Action(GetCoffeeMenu)
  async getCoffeeMenu(ctx: StateContext<App>) {
    console.log("in getCoffeeMenu");
    try {
      const coffeeMenu = await this.coffeeSvc.getList();

      const state = ctx.getState();

      ctx.setState({
        ...state,
        coffeeMenu,
      });
    } catch (error) {
      ctx.dispatch(new GetCoffeeMenuFailed(error));
    }
  }

  @Action([AddToCart, AddOneCartItem])
  addToCartino(ctx: StateContext<App>, action: AddToCart) {
    const state = ctx.getState();

    // Find item (and more specifically, its quantity) of that type that is already in the cart
    const { quantity = 0 } =
      state.cart.find((x) => x.name === action.payload) || {};

    let incrementedQuantity = quantity + 1;

    // Form the new cart. Leave other items as-is, increment the quantity of the item in question
    const newCart = [
      ...state.cart.filter((x) => x.name !== action.payload), // leave others untouched
      {
        name: action.payload,
        quantity: incrementedQuantity, // increment only this one
      },
    ];

    ctx.setState({
      ...state,
      cart: newCart,
    });
  }

  @Action(RemoveCartItem)
  removeCartItem(ctx: StateContext<App>, action: RemoveCartItem) {
    const state = ctx.getState();

    const current = {
      cart: [...state.cart.filter((x) => x.name !== action.payload)],
    };

    ctx.setState({
      ...state,
      ...current,
    });
  }

  @Action(RemoveOneCartItem)
  removeOneCartItem(ctx: StateContext<App>, action: RemoveOneCartItem) {
    const state = ctx.getState();

    const item = state.cart.find((x) => x.name === action.payload);

    const current = {
      cart: [
        ...state.cart.filter((x) => x.name !== action.payload),
        ...(item.quantity - 1 <= 0
          ? []
          : [{ name: item.name, quantity: item.quantity - 1 }]),
      ],
    };

    ctx.setState({
      ...state,
      ...current,
    });
  }

  @Action(EmptyCart)
  emptyCart(ctx: StateContext<App>, action: EmptyCart) {
    const state = ctx.getState();

    const current = {
      cart: [],
    };

    ctx.setState({
      ...state,
      ...current,
    });
  }

  @Action(AddToCoffeeMenu)
  addToCoffeeMenu(ctx: StateContext<App>, action: AddToCoffeeMenu) {
    const state = ctx.getState();

    const current = {
      coffeeMenu: [...state.coffeeMenu, ...action.payload],
    };

    ctx.setState({
      ...state,
      ...current,
    });
  }

  @Action(DummySetState)
  dummySetState(ctx: StateContext<App>, action: DummySetState) {
    const state = ctx.getState();

    const current = {
      ...action.payload,
    };

    ctx.setState({
      ...state,
      ...current,
    });
  }
}
