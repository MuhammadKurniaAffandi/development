import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { getInvoiceByOrderId } from "../../api/invoice";
import { Button, LayoutOne, Table, Text } from "upkit";
import TopBar from "../../components/TopBar";
import BounceLoader from "react-spinners/BounceLoader";
import { formatRupiah } from "../../utils/format-rupiah";
import StatusLabel from "../../components/StatusLabel";
import Axios from "axios";

export default function Invoice() {
  /* membuat beberapa state lokal untuk menyimpan data invoice, error dan status request: */
  let [invoice, setInvoice] = useState(null);
  let [error, setError] = useState("");
  let [status, setStatus] = useState("process");

  // (1) dapatkan `params`
  let { params } = useRouteMatch();

  useEffect(() => {
    // membaca nilai order_id
    // memberikan params?.order_id pada helper getInvoiceByOrderId
    getInvoiceByOrderId(params?.order_id)
      .then(({ data }) => {
        // (1) cek apakah ada error
        if (data?.error) {
          setError(data.message || "Terjadi kesalahan yang tidak diketahui");
        }
        // update state invoice jika tidak ada error
        setInvoice(data);
      })
      .finally(() => setStatus("idle")); // lalu setStatus menjadi idle
  }, [params]);

  // COnfig untuk Midtrans
  let [initiatingPayment, setInitiating] = useState(false);
  let [requestError, setRequestError] = useState(false);

  /* kondisi jika terjadi error */
  if (error.length) {
    return (
      <LayoutOne>
        <TopBar />
        <Text as="h3">Terjadi Kesalahan</Text>
        {error}
      </LayoutOne>
    );
  }

  /* kondisi jika status sedang proses */
  if (status === "process") {
    return (
      <LayoutOne>
        <div className="text-center py-10">
          <div className="inline-block">
            <BounceLoader color="red" />
          </div>
        </div>
      </LayoutOne>
    );
  }

  let handlePayment = async function () {
    setInitiating(true);

    let {
      data: { token },
    } = await Axios.get(
      `${process.env.REACT_APP_API_HOST}/api/invoices/${params?.order_id}/initiate-payment`
    );

    if (!token) {
      setRequestError(true);
      return;
    }

    setInitiating(false);
    window.snap.pay(token);
  };

  return (
    <LayoutOne>
      <TopBar />
      <Text as="h3"> Invoice </Text>
      <br />
      <Table
        showPagination={false}
        items={[
          {
            label: "Status",
            value: <StatusLabel status={invoice?.payment_status} />,
          },
          { label: "Order ID", value: "#" + invoice?.order?.order_number },
          { label: "Total amount", value: formatRupiah(invoice?.total) },
          {
            label: "Billed to",
            value: (
              <div>
                <b>{invoice?.user?.full_name} </b>
                <br />
                {invoice?.user?.email} <br />
                <br />
                {invoice?.delivery_address?.detail} <br />
                {invoice?.delivery_address?.kelurahan},
                {invoice?.delivery_address?.kecamatan} <br />
                {invoice?.delivery_address?.kabupaten} <br />
                {invoice?.delivery_address?.provinsi}
              </div>
            ),
          },
          {
            label: "Payment to",
            value: (
              <div>
                {process.env.REACT_APP_OWNER} <br />
                {process.env.REACT_APP_CONTACT} <br />
                {process.env.REACT_APP_BILLING_NO} <br />
                {process.env.REACT_APP_BILLING_BANK} <br />
                {invoice.payment_status !== "paid" ? (
                  <>
                    <Button
                      onClick={handlePayment}
                      disabled={initiatingPayment}
                    >
                      {" "}
                      {initiatingPayment
                        ? "Loading ... "
                        : "Bayar dengan Midtrans"}{" "}
                    </Button>
                  </>
                ) : null}
                {requestError ? (
                  <>
                    <div className="text-red-400">
                      Terjadi kesalahan saat meminta token untuk pembayaran.
                    </div>
                  </>
                ) : null}
              </div>
            ),
          },
        ]}
        columns={[
          { Header: "Invoice", accessor: "label" },
          { Header: "", accessor: "value" },
        ]}
      />
    </LayoutOne>
  );
}
