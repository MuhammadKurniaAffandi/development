import axios from "axios";

export async function getProducts(params) {
  return await axios.get(`${process.env.REACT_APP_API_HOST}/api/products`, {
    params,
  });
}
