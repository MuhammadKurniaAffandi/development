import store from "./store";
import { saveCart } from "../api/cart";

// definisikan variabel tanpa nilai awal
let currentAuth;
let currentCart;

// mendefinisikan fungsi listener
function listener() {
  let previousAuth = currentAuth;
  let previousCart = currentCart;

  currentAuth = store.getState().auth;
  currentCart = store.getState().cart;

  /* dapatkan token dari auth */
  let { token } = currentAuth;

  // pengelolahan untuk Auth
  if (currentAuth !== previousAuth) {
    localStorage.setItem("auth", JSON.stringify(currentAuth));
    // saveCart saat `auth` berubah
    saveCart(token, currentCart);
  }

  /* Pengelolahan untuk Cart */
  if (currentCart !== previousCart) {
    localStorage.setItem("cart", JSON.stringify(currentCart));
    // saveCart saat `cart` berubah
    saveCart(token, currentCart);
  }
}
// buat fungsi listen
function listen() {
  // (1) dengarkan perubahan store
  store.subscribe(listener);
}
// (2) export fungsi listen supaya bisa digunakan di file lain
export { listen };
