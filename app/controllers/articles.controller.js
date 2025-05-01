const {
  selectArticles,
  selectArticleById,
  updateArticleById,
} = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
  const { sort_by } = req.query;
  const { order } = req.query;

  return selectArticles(sort_by, order)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article ID" });
  }

  return selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article ID" });
  } else if (!inc_votes) {
    return res.status(400).send({ msg: "Missing 'inc_votes' key" });
  } else if (isNaN(inc_votes)) {
    return res
      .status(400)
      .send({ msg: "Invalid value for 'inc_votes': expected a number" });
  }

  return updateArticleById(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch(next);
};
