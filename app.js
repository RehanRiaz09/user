const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require("./routes/users")

mongoose.connect("mongodb://127.0.0.1:27017/user");
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use("/user", userRoutes)
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;