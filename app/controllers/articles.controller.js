const {
  selectArticles,
  selectArticleById,
  updateArticleById,
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

exports.patchArticleById = (req, res, next) => {
  const id = req.params.article_id;
  const newVote = req.body.inc_votes;

  if (isNaN(id)) {
    return res.status(400).send({ msg: "Invalid article ID" });
  } else if (!newVote) {
    return res.status(400).send({ msg: "Missing 'inc_votes' key" });
  } else if (isNaN(newVote)) {
    return res
      .status(400)
      .send({ msg: "Invalid value for 'inc_votes': expected a number" });
  }

  return updateArticleById(id, newVote)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch(next);
};
