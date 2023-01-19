const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../user/model");
const config = require("../config");
const { getToken } = require("../utils/get-token");

function me(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `Your're not login or token expired`,
    });
  }

  return res.json(req.user);
}

async function localStrategy(email, password, done) {
  try {
    let user = await User.findOne({ email }).select(
      "-__v -createdAt -updatedAt -cart_items -token"
    );

    if (!user) return done();

    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());

      return done(null, userWithoutPassword);
    }
  } catch (err) {
    done(err, null);
  }

  done(); // <---
}

async function register(req, res, next) {
  try {
    const payload = req.body;

    let user = new User(payload);

    await user.save();

    return res.json(user);
  } catch (err) {
    // (1) cek kemungkinan kesalahan terkait validasi
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) error lainnya
    next(err);
  }
}

async function login(req, res, next) {
  passport.authenticate("local", async function (err, user) {
    if (err) return next(err);

    if (!user)
      return res.json({ error: 1, message: "email or password incorrect" });

    // (1) buat JSON Web Token
    let signed = jwt.sign(user, config.secretKey); // <--- ganti secret key dengan keymu sendiri, bebas yang sulit ditebak

    // (2) simpan token tersebut ke user terkait
    await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { token: signed } },
      { new: true }
    );

    // (3) response ke _client_
    return res.json({
      message: "logged in successfully",
      user: user,
      token: signed,
    });
  })(req, res, next);
}

async function logout(req, res, next) {
  let token = getToken(req);

  let user = await User.findOneAndUpdate(
    { token: { $in: [token] } },
    { $pull: { token } },
    { useFindAndModify: false }
  );

  if (!user || !token) {
    return res.json({
      error: 1,
      message: "User tidak ditemukan",
    });
  }

  // --- logout berhasil ---//

  return res.json({
    error: 0,
    message: "Logout berhasil",
  });
}

module.exports = {
  register,
  localStrategy,
  login,
  me,
  logout,
};

// const User = require("../user/model");
// const passport = require("passport");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const config = require("../config");
// const { getToken } = require("../utils/get-token");

// /* function untuk register */
// async function register(req, res, next) {
//   try {
//     const payload = req.body;
//     let user = new User(payload);
//     await user.save();
//     return res.json(user);
//   } catch (error) {
//     // (1) cek kemungkinan kesalahan terkait validasi
//     if (error && error.name === "ValidationError") {
//       return res.json({
//         error: 1,
//         message: error.message,
//         fields: error.errors,
//       });
//     }
//     // (2) error lainnya
//     next(error);
//   }
// }

// /* function untuk localStrategy atau mengecek email dan password */
// async function localStrategy(email, password, done) {
//   try {
//     let user = await User.findOne({ email }).select(
//       "-__v -createdAt -updatedAt -cart_items -token"
//     );
//     if (!user) return done();

//     if (bcrypt.compareSync(password, user.password)) {
//       ({ password, ...userWithoutPassword } = user.toJSON());
//       return done(null, userWithoutPassword);
//     }
//   } catch (error) {
//     done(error, null);
//   }

//   done();
// }

// /* function untuk login */
// async function login(req, res, next) {
//   passport.authenticate("local", async function (err, user) {
//     if (err) return next(err);
//     if (!user)
//       return res.json({
//         error: 1,
//         message: "email or password incorect!",
//       });

//     let signed = jwt.sign(user, config.secretKey);
//     await User.findOneAndUpdate(
//       { _id: user._id },
//       { $push: { token: signed } },
//       { new: true }
//     );

//     return res.json({
//       message: "logged in successfuly",
//       user: user,
//       token: signed,
//     });
//   })(req, res, next);
// }

// /* function untuk mendapatkan data user yang sedang login */
// function me(req, res, next) {
//   if (!req.user) {
//     return res.json({
//       error: 1,
//       message: "Youre not login or token expired",
//     });
//   }

//   return res.json(req.user);
// }

// /* function untuk logout */
// async function logout(req, res, next) {
//   let token = getToken(req);
//   let user = await User.findOneAndUpdate(
//     { token: { $in: [token] } },
//     { $pull: { token } },
//     { useFindAndModify: false }
//   );

//   /* cek user atau token */
//   if (!user || !token) {
//     return res.json({
//       error: 1,
//       message: "No User Found",
//     });
//   }

//   /* logout berhasil */
//   return res.json({
//     error: 0,
//     message: "Logout Berhasil",
//   });
// }

// module.exports = {
//   register,
//   localStrategy,
//   login,
//   me,
//   logout,
// };
