import axios from "axios";

export async function getInvoiceByOrderId(order_id) {
  // baca token dari Local Storage dan lakukan request ke Web API
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};

  return await axios.get(
    `${process.env.REACT_APP_API_HOST}/api/invoices/${order_id}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
}
