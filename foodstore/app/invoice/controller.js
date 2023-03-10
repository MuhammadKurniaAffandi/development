const { subject } = require("@casl/ability");
const midtransClient = require("midtrans-client");

const Invoice = require("./model");
const Order = require("../order/model");
const { policyFor } = require("../policy");
const config = require("../config");

let snap = new midtransClient.Snap({
  isProduction: config.midtrans.isProduction,
  serverKey: config.midtrans.serverKey,
  clientKey: config.midtrans.clientKey,
});
// Endpoint Read Invoice
async function show(req, res, next) {
  try {
    // dapatkan _route_ params `order_id`
    let { order_id } = req.params;

    // dapatkan data `invoice` berdasarkan `order_id`
    let invoice = await Invoice.findOne({ order: order_id })
      .populate("order")
      .populate("user");

    // deklarasikan `policy` untuk `user`
    let policy = policyFor(req.user);

    // buat `subjectInvoice`
    let subjectInvoice = subject("Invoice", {
      ...invoice,
      user_id: invoice.user._id,
    });

    //  cek policy `read` menggunakan `subjectInvoice`
    if (!policy.can("read", subjectInvoice)) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk melihat invoice ini.`,
      });
    }
    // respon ke _client_
    return res.json(invoice);
  } catch (err) {
    return res.json({
      error: 1,
      message: `Error when getting invoice.`,
    });
  }
}

// untuk Menginisiasi Pembayaran / Payment
async function initiatePayment(req, res) {
  try {
    // (1) dapatkan parameter `order_id`
    let { order_id } = req.params;

    // (2) cari invoice berdasarkan `order_id` dapatkan juga relasi `order` dan `user`
    let invoice = await Invoice.findOne({ order: order_id })
      .populate("order")
      .populate("user");

    // (3) jika invoice tidak ditemukan, stop
    if (!invoice) {
      return res.json({
        error: 1,
        message: "Invoice not found",
      });
    }

    // (4) bangun parameter untuk dikirimkan ke midtrans
    let parameter = {
      transaction_details: {
        order_id: invoice.order._id,
        gross_amount: invoice.total,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: invoice.user.full_name,
        email: invoice.user.email,
      },
    };

    // (5) kirimkan informasi invoice / order yang hendak di bayar ke midtrans
    let response = await snap.createTransaction(parameter);

    // (6) response ke client dengan resposne dari midtrans

    return res.json(response);
  } catch (err) {
    // (7) penanganan error
    return res.json({
      error: 1,
      message: "Something when wrong",
    });
  }
}

// untuk Menangani Notifikasi dari Midtrans
async function handleMidtransNotification(req, res) {
  try {
    // (1) kirim data notifikasi dari `req.body` ke midtrans
    let statusResponse = await snap.transaction.notification(req.body);

    // (2) kita ekstrak informasi yang kita perlukan dari response kode sebelumnya
    let orderId = statusResponse.order_id;
    let transactionStatus = statusResponse.transaction_status;
    let fraudStatus = statusResponse.fraud_status;

    // (3) cek jika status == 'capture' ini khusu pembayaran via kartu kredit
    if (transactionStatus == "capture") {
      // (4) fraudStatus bernilai 'challenge'
      if (fraudStatus == "challenge") {
        // (4.a) approve transaksi
        await snap.transaction.approve(orderId);

        // (4.b) ubah status invoice di database kita menjadi "paid"
        await Invoice.findOneAndUpdate(
          { order: orderId },
          { payment_status: "paid" }
        );

        // (4.c) ubah juga status order menjadi 'processing' bukan `waiting_payment` lagi
        await Order.findOneAndUpdate(
          { _id: orderId },
          { status: "processing" }
        );

        // (4.d) response 200 dengan konten bebas, yang penting status 200
        return res.json("success");
      } else if (fraudStatus == "accept") {
        // (5) jika status 'accept' update data di database kita seperti sebelumnya

        await Invoice.findOneAndUpdate(
          { order: orderId },
          { payment_status: "paid" }
        );

        await Order.findOneAndUpdate(
          { _id: orderId },
          { status: "processing" }
        );

        return res.json("success");
      } else {
        // (6) selain itu abaikan saja, gak perlu melakukan perubahan apapun di database
        return res.json("ok");
      }
    } else if (transactionStatus == "settlement") {
      // (7) jika transactionStatus == 'settlement' (untuk non kartu kredit, artinya berhasil juga)
      // update juga data invoice dan order di database kita

      await Invoice.findOneAndUpdate(
        { order: orderId },
        { payment_status: "paid" },
        { new: true }
      );

      await Order.findOneAndUpdate({ _id: orderId }, { status: "delivered" });

      return res.json("success");
    }
  } catch (err) {
    // (8) tangani error
    return res.status(500).json("Something went wrong");
  }
}

module.exports = {
  show,
  initiatePayment,
  handleMidtransNotification,
};
