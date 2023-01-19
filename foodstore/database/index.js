/* import package mongoose */
const mongoose = require("mongoose");

/* konfigurasi terkait MongoDB dari 'app/config.js' */
const { dbHost, dbName, dbPort, dbUser, dbPass } = require("../app/config.js");

/* connect ke MongoDB menggunakan konfigurasi yang sudah diimport */
mongoose.connect(
  `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    /* useFindAndModify: false,
    useCreateIndex: true, */
  }
);

/* simpan koneksi ke dalam constant 'db' */
const db = mongoose.connection;

/* export 'db' agar dapat digunakan oleh file lain */
module.exports = db;
