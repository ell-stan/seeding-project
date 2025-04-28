const { selectArticleById } = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const id = req.params.article_id;
  return selectArticleById(id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
