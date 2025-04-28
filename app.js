const express = require("express");
const app = express();
const db = require("./db/connection.js");
const endpointsJson = require("./endpoints.json");

app.get("/api", (req, res) => {
  res.send({ endpoints: endpointsJson });
});

module.exports = app;
