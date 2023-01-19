import React, { useState } from "react";
import {
  InputText,
  InputPassword,
  Button,
  FormControl,
  Card,
  LayoutOne,
} from "upkit";
import { useForm } from "react-hook-form";
import { Link, useHistory } from "react-router-dom";

import StoreLogo from "../../components/StoreLogo";
import { useDispatch } from "react-redux";
import { userLogin } from "../../features/Auth/actions";
import { rules } from "./validation";
import { login } from "../../api/auth";

/* =========================== */
const statuslist = {
  idle: "idle",
  process: "process",
  success: "success",
  error: "error",
};
export default function Login() {
  const { register, handleSubmit, errors, setError } = useForm();
  const [status, setStatus] = useState(statuslist.idle);
  const dispatch = useDispatch();
  const history = useHistory();

  /* ==================== */
  const onSubmit = async ({ email, password }) => {
    setStatus(statuslist.process);
    let { data } = await login(email, password);

    if (data.error) {
      setError("password", {
        type: "invalidCredential",
        message: data.message,
      });
      setStatus(statuslist.error);
    } else {
      let { user, token } = data;

      dispatch(userLogin(user, token));
      history.push("/");
    }
    setStatus(statuslist.success);
  };

  return (
    <LayoutOne size="small">
      <Card color="white">
        <div className="text-center mb-5">
          <StoreLogo />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* (2) Input Email */}
          <FormControl errorMessage={errors.email && errors.email.message}>
            <InputText
              name="email"
              placeholder="Email"
              fitContainer
              ref={register(rules.email)}
            />
          </FormControl>
          {/* (3) Input Password */}
          <FormControl
            errorMessage={errors.password && errors.password.message}
          >
            <InputPassword
              name="password"
              placeholder="Password"
              fitContainer
              ref={register(rules.password)}
            />
          </FormControl>

          {/* (5) Button */}
          <Button size="large" fitContainer disabled={status === "process"}>
            Login
          </Button>
        </form>

        <div className="text-center mt-2">
          Belum punya akun?
          <Link to="/register">
            <b>Daftar Sekarang</b>
          </Link>
        </div>
      </Card>
    </LayoutOne>
  );
}
