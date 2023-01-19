import axios from "axios";

/* untuk mengambil atau get address */
export async function getAddress(params) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.get(
    `${process.env.REACT_APP_API_HOST}/api/delivery-addresses`,
    {
      params: {
        limit: params.limit,
        skip: params.page * params.limit - params.limit,
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
}

/* untuk create atau membuat address  */
export async function createAddress(payload) {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};
  return await axios.post(
    `${process.env.REACT_APP_API_HOST}/api/delivery-addresses`,
    payload,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
}
