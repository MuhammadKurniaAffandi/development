import React, { useEffect, useState } from "react";
import axios from "axios";
import { oneOf, number, oneOfType, string, shape, func } from "prop-types";
import { Select } from "upkit";

export default function SelectWilayah({ tingkat, kodeInduk, onChange, value }) {
  /* mendefinisikan state lokal */
  let [data, setData] = useState([]);
  let [isFetching, setIsFetching] = useState(false);

  /* untuk mendapatkan data wilayah dari Web API */
  useEffect(() => {
    setIsFetching(true);

    axios
      .get(
        `${process.env.REACT_APP_API_HOST}/api/wilayah/${tingkat}?
   kode_induk=${kodeInduk}`
      )
      .then(({ data }) => setData(data))
      .finally((_) => setIsFetching(false));
  }, [kodeInduk, tingkat]);

  return (
    <Select
      options={data.map((wilayah) => ({
        label: wilayah.nama,
        value: wilayah.kode,
      }))}
      onChange={onChange}
      value={value}
      isLoading={isFetching}
      isDisabled={isFetching || !data.length}
    />
  );
}

SelectWilayah.defaultProps = {
  tingkat: "provinsi",
};

/* mendefinisikan propTypes untuk komponen Select Wilayah */
SelectWilayah.propTypes = {
  tingkat: oneOf(["provisi", "kabupaten", "kemacatan", "desa"]),
  kodeInduk: oneOfType([number, string]),
  onChange: func,
  value: shape({ label: string, value: oneOfType([string, number]) }),
};
