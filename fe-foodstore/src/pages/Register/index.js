import React, { useState } from "react";
import {
  Button,
  Card,
  FormControl,
  InputPassword,
  InputText,
  LayoutOne,
} from "upkit";
import { useForm } from "react-hook-form";
import { rules } from "./validation";
import { registerUser } from "../../api/auth";
import { Link, useHistory } from "react-router-dom";
import StoreLogo from "../../components/StoreLogo";

/* ================================================================================== */
// statuslist
const statuslist = {
  idle: "idle",
  process: "process",
  success: "success",
  error: "error",
};

/* ===================================================================================== */

export default function Register() {
  let { register, handleSubmit, errors, setError } = useForm();
  let [status, setStatus] = useState(statuslist.idle);
  let history = useHistory();

  /* ================ */
  // buat fungsi untuk menangani form submit
  const onSubmit = async (formData) => {
    // cek password
    let { password, password_confirmation } = formData;

    /* cek jika password tidak cocok dengan konfirmasi password */
    if (password !== password_confirmation) {
      return setError("password_confirmation", {
        type: "equality",
        message: "Konfirmasi password harus sama dengan password",
      });
    }
    setStatus(statuslist.process);

    let { data } = await registerUser(formData);
    /* pengecekan jika ada error */
    if (data.error) {
      let fields = Object.keys(data.fields);
      // untuk masing-masing field kita terapkan error dan tangkap pesan errornya
      fields.forEach((field) => {
        setError(field, {
          type: "server",
          message:
            data.fields[field].properties &&
            data.fields[field].properties.message,
        });
      });

      setStatus(statuslist.error);
    }
    setStatus(statuslist.success);
    history.push("/register/berhasil");
    console.log(data);
    console.log(data.error);
    console.log(data.fields);
  };

  return (
    <LayoutOne size="small">
      <Card color="white">
        <div className="text-center mb-5">
          <StoreLogo />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            errorMessage={errors.full_name && errors.full_name.message}
          >
            <InputText
              name="full_name"
              placeholder="Nama Lengkap"
              fitContainer
              ref={register(rules.full_name)}
            />
          </FormControl>
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
          {/* (4) Input Konfirmasi Password */}
          <FormControl
            errorMessage={
              errors.password_confirmation &&
              errors.password_confirmation.message
            }
          >
            <InputPassword
              name="password_confirmation"
              placeholder="Konfirmasi Password"
              fitContainer
              ref={register(rules.password_confirmation)}
            />
          </FormControl>
          {/* (5) Button */}
          <Button
            size="large"
            fitContainer
            disabled={status === statuslist.process}
          >
            {status === statuslist.process ? "Sedang Memproses" : "Daftar"}
          </Button>
        </form>

        <div className="text-center mt-2">
          Sudah punya akun?
          <Link to="/login">
            <b> Masuk Sekarang.</b>
          </Link>
        </div>
      </Card>
    </LayoutOne>
  );
}
