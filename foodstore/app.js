var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
/* file product router */
const productRouter = require("./app/product/router");
/* file category router */
const categoryRouter = require("./app/category/router");
/* file tag router */
const tagRouter = require("./app/tag/router");
/* file auth router */
const authRouter = require("./app/auth/router");
/* file middleware auth */
const { decodeToken } = require("./app/auth/middleware");
const wilayahRouter = require("./app/wilayah/router");
const deliveryRouter = require("./app/delivery-address/router");
const cartRouter = require("./app/cart/router");
const orderRouter = require("./app/order/router");
const invoiceRouter = require("./app/invoice/router");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(decodeToken());

/* gunakan product router */
app.use("/api", productRouter);
/* gunakan category router */
app.use("/api", categoryRouter);
/* gunakan tag router */
app.use("/api", tagRouter);
/* gunakan wilayah router */
app.use("/api", wilayahRouter);
/* gunakan delivery router */
app.use("/api", deliveryRouter);
/* gunakan Cart router */
app.use("/api", cartRouter);
/* gunakan Order router */
app.use("/api", orderRouter);
/* gunakan Invoice router */
app.use("/api", invoiceRouter);
/* gunakan auth router */
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
