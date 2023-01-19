import axios from "axios";

/* fungsi registrasi */
export async function registerUser(data) {
  return await axios.post(
    `${process.env.REACT_APP_API_HOST}/auth/register`,
    data
  );
}

/* fungsi login */
export async function login(email, password) {
  return await axios.post(`${process.env.REACT_APP_API_HOST}/auth/login`, {
    email,
    password,
  });
}

/* fungsi logout */
export async function logout() {
  let { token } = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth"))
    : {};
  return await axios
    .post(`${process.env.REACT_APP_API_HOST}/auth/logout`, null, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      localStorage.removeItem("auth");
      return response;
    });
}
