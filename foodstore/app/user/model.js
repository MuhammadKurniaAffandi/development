const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const bcrypt = require("bcrypt");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const HASH_ROUND = 10;

let userSchema = Schema(
  {
    full_name: {
      type: String,
      required: [true, "Nama harus diisi"],
      maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
      minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
    },
    customer_id: {
      type: Number,
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      maxlength: [255, "Panjang Email maksimal 255 karakter"],
    },
    password: {
      type: String,
      required: [true, "Password harus diisi"],
      maxlength: [255, "Panjang Password maksimal 255 karakter"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: [String],
  },
  { timestamps: true }
);

/* custom validasi email sudah terdaftar */
userSchema.path("email").validate(
  async function (value) {
    try {
      const count = await this.model("User").count({ email: value });

      return !count;
    } catch (error) {
      throw error;
    }
  },
  (attr) => `${attr.value} email sudah terdaftar`
);

/* custom validasi email */
userSchema.path("email").validate(
  function (value) {
    // (1) email regular expression
    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    // (2) test email, hasilnya adalah `true` atau `false`
    // jika ternyata `true` maka validasi berhasil
    // jika ternyata `false` maka validasi gagal
    return EMAIL_RE.test(value);
  },
  (attr) => `${attr.value} harus merupakan email yang valid!`
);

/* mongoose hook untuk hashing password */
userSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

/* AutoIncrement */
userSchema.plugin(AutoIncrement, { inc_field: "customer_id" });

module.exports = model("User", userSchema);
