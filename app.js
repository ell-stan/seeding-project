const express = require("express");
const app = express();
const endpointsJson = require("./endpoints.json");
const { getTopics } = require("./app/controllers/topics.controller.js");

app.get("/api", (req, res) => {
  res.send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Path does not exist" });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
