import * as axios from "axios";
// import { config } from "../config";

// untuk mengambil data orders atua getOrders
export async function getOrders(params) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  let { limit, page } = params;
  let skip = page * limit - limit;

  return await axios.get(`${process.env.REACT_APP_API_HOST}/api/orders`, {
    params: {
      skip,
      limit,
    },
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

/* untuk mengirimkan request pembuatan order baru. */
export async function createOrder(payload) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.post(
    `${process.env.REACT_APP_API_HOST}/api/orders`,
    payload,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
}
