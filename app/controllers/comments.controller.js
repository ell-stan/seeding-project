const {
  selectCommentsByArticleId,
  insertCommentByArticleId,
} = require("../models/comments.models.js");

exports.getCommentsByArticleId = (req, res, next) => {
  const id = req.params.article_id;
  const sort_by = req.query.sort_by;
  const order = req.query.order;

  return selectCommentsByArticleId(id, sort_by, order)
    .then((comments) => {
      res.status(200).send({ comments });
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
