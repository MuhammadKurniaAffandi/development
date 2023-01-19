import { useCallback, useEffect, useState } from "react";
import { getAddress } from "../api/address";

const statuslist = {
  idle: "idle",
  process: "process",
  success: "success",
  error: "error",
};

export function useAddressData() {
  let [data, setData] = useState([]);
  let [count, setCount] = useState(0);
  let [status, setStatus] = useState(statuslist.idle);
  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(10);

  /* fungsi untuk fetch Address */
  let fetchAddress = useCallback(
    async function () {
      /* ubah status menjadi process */
      setStatus(statuslist.process);

      /* request alamat pengiriman dari Web API */
      let {
        data: { data, count, error },
      } = await getAddress({ page, limit });

      /* pengecekan jika mendapat error dari respon server */
      if (error) {
        setStatus(statuslist.error);
        return;
      }

      /* jika data alamat pengiriman berhasil didapatkan */
      setStatus(statuslist.success);
      setData(data);
      setCount(count);
    },
    [page, limit]
  );

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

  /* untuk mengembalikan lokal state dan beberapa fungsi updater */
  return {
    data,
    count,
    status,
    page,
    limit,
    setPage,
    setLimit,
  };
}
