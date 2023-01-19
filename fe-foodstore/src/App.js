import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import "upkit/dist/style.min.css";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import store from "./app/store";
// import fungsi listen
import { listen } from "./app/listener";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import Login from "./pages/Login";
import { getCart } from "./api/cart";
import UserAddressAdd from "./pages/UserAddressAdd";
import UserAddress from "./pages/UserAddress";
import Checkout from "./pages/Checkout";
import Invoice from "./pages/Invoice";
import UserAccount from "./pages/UserAccount";
import UserOrders from "./pages/UserOrders";
import Logout from "./pages/Logout";
import GuardRoute from "./components/GuardRoute";
import GuestOnlyRoute from "./components/GuestOnlyRoute";

function App() {
  // panggil fungsi listen() sekali saja saat komponen selesai render pertama kali
  React.useEffect(() => {
    listen();
    getCart();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <GuardRoute path="/invoice/:order_id">
            <Invoice />
          </GuardRoute>

          <GuestOnlyRoute path="/login">
            <Login />
          </GuestOnlyRoute>

          <GuestOnlyRoute path="/register/berhasil">
            <RegisterSuccess />
          </GuestOnlyRoute>

          <GuestOnlyRoute path="/register">
            <Register />
          </GuestOnlyRoute>

          <GuardRoute path="/alamat-pengiriman/tambah">
            <UserAddressAdd />
          </GuardRoute>

          <GuardRoute path="/alamat-pengiriman">
            <UserAddress />
          </GuardRoute>

          <GuardRoute path="/checkout">
            <Checkout />
          </GuardRoute>

          <GuardRoute path="/account">
            <UserAccount />
          </GuardRoute>

          <GuardRoute path="/pesanan">
            <UserOrders />
          </GuardRoute>

          <GuardRoute path="/logout">
            <Logout />
          </GuardRoute>

          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
