import axios from "axios";

import store from "../app/store";
import { setItems } from "../features/Cart/actions";

/* endpoint untuk save atau menyimpan cart */
/* Untuk mengirimkan data cart ke Web API kita
memerlukan token dari pengguna yang sedang login */
/* Selain itu, tentu kita juga memerlukan data cart, oleh karena itu sebagai parameter kedua kita juga perlu cart */
export async function saveCart(token, cart) {
  return await axios.put(
    `${process.env.REACT_APP_API_HOST}/api/carts`,
    { items: cart },
    {
      // dapatkan token user yang login
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
}

/* endpoint Memuat Data cart dari Web API */
export async function getCart() {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  if (!token) return;

  let { data } = await axios.get(
    `${process.env.REACT_APP_API_HOST}/api/carts`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (!data.error) {
    store.dispatch(setItems(data));
  }
}
