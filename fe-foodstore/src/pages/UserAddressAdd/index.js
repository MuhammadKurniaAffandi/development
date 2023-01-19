import React, { useEffect } from "react";
import { rules } from "./validation";
import { LayoutOne, InputText, FormControl, Textarea, Button } from "upkit";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import TopBar from "../../components/TopBar";
import SelectWilayah from "../../components/SelectWilayah";
import { createAddress } from "../../api/address";

export default function UserAddressAdd() {
  let { handleSubmit, register, errors, setValue, watch, getValues } =
    useForm();

  let allFields = watch();
  let history = useHistory();

  /* Effect untuk Provinsi */
  useEffect(() => {
    register({ name: "provinsi" }, rules.provinsi);
    register({ name: "kabupaten" }, rules.kabupaten);
    register({ name: "kecamatan" }, rules.kecamatan);
    register({ name: "kelurahan" }, rules.kelurahan);
  }, [register]);

  /* penanganan untuk perubahan kabupaten */
  useEffect(() => {
    setValue("kabupaten", null);
    setValue("kecamatan", null);
    setValue("kelurahan", null);
  }, [allFields.provinsi, setValue]);

  // jika kabupaten berubah, kecamatan dan kelurahan jadikan null

  useEffect(() => {
    setValue("kecamatan", null);
    setValue("kelurahan", null);
  }, [allFields.kabupaten, setValue]);

  // jika kabupaten berubah, kelurahan jadikan null

  useEffect(() => {
    setValue("kelurahan", null);
  }, [allFields.kecamatan, setValue]);

  const updateValue = (field, value) =>
    setValue(field, value, { shouldValidate: true, shouldDirty: true });

  /* fungsi untuk submit */
  const onSubmit = async (formData) => {
    let payload = {
      nama: formData.nama_alamat,
      detail: formData.detail_alamat,
      provinsi: formData.provinsi.label,
      kabupaten: formData.kabupaten.label,
      kecamatan: formData.kecamatan.label,
      kelurahan: formData.kelurahan.label,
    };

    let { data } = await createAddress(payload);

    if (data.error) {
      return;
    }

    history.push("/alamat-pengiriman");
  };

  return (
    <LayoutOne>
      <TopBar />
      <br />
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Nama Alamat */}
          <FormControl
            label="Nama Alamat"
            color="black"
            errorMessage={errors.nama_alamat && errors.nama_alamat.message}
          >
            <InputText
              name="nama_alamat"
              placeholder="Nama Alamat"
              fitContainer
              ref={register(rules.nama_alamat)}
            />
          </FormControl>

          {/* Proivinsi */}
          <FormControl
            label="Provinsi"
            errorMessage={errors.provinsi && errors.provinsi.message}
            color="black"
          >
            <SelectWilayah
              onChange={(option) => updateValue("provinsi", option)}
              name="provinsi"
              value={getValues().provinsi}
            />
          </FormControl>

          {/* Kabupatan */}
          <FormControl
            label="Kabupaten/kota"
            errorMessage={errors.kabupaten && errors.kabupaten.message}
            color="black"
          >
            <SelectWilayah
              tingkat="kabupaten"
              kodeInduk={getValues().provinsi && getValues().provinsi.value}
              onChange={(option) => updateValue("kabupaten", option)}
              value={getValues().kabupaten}
            />
          </FormControl>

          {/* Kecamatan */}
          <FormControl
            label="Kecamatan"
            errorMessage={errors.kecamatan && errors.kecamatan.message}
            color="black"
          >
            <SelectWilayah
              tingkat="kecamatan"
              kodeInduk={getValues().kabupaten && getValues().kabupaten.value}
              onChange={(option) => updateValue("kecamatan", option)}
              value={getValues().kecamatan}
            />
          </FormControl>

          {/* Kelurahan */}
          <FormControl
            label="Kelurahan"
            errorMessage={errors.kelurahan && errors.kelurahan.message}
            color="black"
          >
            <SelectWilayah
              tingkat="desa"
              kodeInduk={getValues().kecamatan && getValues().kecamatan.value}
              onChange={(option) => updateValue("kelurahan", option)}
              value={getValues().kelurahan}
            />
          </FormControl>

          {/* Detail Alamat */}
          <FormControl
            label="Detail alamat"
            errorMessage={errors.detail_alamat && errors.detail_alamat.message}
            color="black"
          >
            <Textarea
              placeholder="Detail alamat"
              fitContainer
              name="detail_alamat"
              ref={register(rules.detail_alamat)}
            />
          </FormControl>

          {/* Button Submit */}
          <Button fitContainer>Simpan</Button>
        </form>
      </div>
    </LayoutOne>
  );
}
