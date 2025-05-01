const {
  selectCommentsByArticleId,
  insertCommentByArticleId,
  deleteCommentById,
} = require("../models/comments.models.js");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { sort_by } = req.query;
  const { order } = req.query;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article ID" });
  }

  return selectCommentsByArticleId(article_id, sort_by, order)
    .then((comments) => {
      const status = comments.length === 0 ? 201 : 200;
      res.status(status).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  const missingFields = [];
  if (!username) missingFields.push("username");
  if (!body) missingFields.push("body");

  if (missingFields.length > 0) {
    return res.status(400).send({
      msg: `Missing field${
        missingFields.length > 1 ? "s" : ""
      }: ${missingFields.join(", ")}`,
    });
  }

  return insertCommentByArticleId(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  if (isNaN(comment_id)) {
    return res.status(400).send({ msg: "Invalid comment ID" });
  }
  return deleteCommentById(comment_id)
    .then(() => res.status(204).send())
    .catch(next);
};
