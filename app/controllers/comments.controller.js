const { selectCommentsByArticleId } = require("../models/comments.models.js");

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
