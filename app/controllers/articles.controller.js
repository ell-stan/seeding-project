const {
  selectArticles,
  selectArticleById,
} = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
  const sort_by = req.query.sort_by;
  const order = req.query.order;

  return selectArticles(sort_by, order)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const id = req.params.article_id;
  return selectArticleById(id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
