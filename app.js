const express = require("express");
const app = express();
const endpointsJson = require("./endpoints.json");
const { getTopics } = require("./app/controllers/topics.controller.js");
const {
  getArticles,
  getArticleById,
  patchArticleById,
} = require("./app/controllers/articles.controller.js");
const { getUsers } = require("./app/controllers/users.controller.js");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
  deleteComment,
} = require("./app/controllers/comments.controller.js");
const cors = require("cors");

app.use(cors());

app.use(express.json());

app.get("/api", (req, res) => {
  res.send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/users", getUsers);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.patch("/api/articles/:article_id", patchArticleById);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Path does not exist" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "23503") {
    res.status(404).send({
      msg: "Username does not exist. Please create an account to post a comment",
    });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
