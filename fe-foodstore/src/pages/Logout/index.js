import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { LayoutOne } from "upkit";
import { useDispatch } from "react-redux";
import BounceLoader from "react-spinners/BounceLoader";

import { userLogout } from "../../features/Auth/actions";
import { logout } from "../../api/auth";

export default function Logout() {
  let history = useHistory();
  let dispatch = useDispatch();

  //   gunakan helper logout di dalam useEffect
  // jika sudah, dispatch Redux action useLogout
  // kemudian Redirect ke halaman Home
  useEffect(() => {
    logout()
      .then(() => dispatch(userLogout()))
      .then(() => history.push("/"));
  }, [history, logout]);

  return (
    <LayoutOne size="small">
      <div className="text-center flex flex-col justify-center items-center">
        <BounceLoader color="red" />
        <br />
        Logging out ...
      </div>
    </LayoutOne>
  );
}
