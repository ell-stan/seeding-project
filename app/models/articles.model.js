const db = require("../../db/connection.js");

exports.selectArticles = (sort_by, order) => {
  let queryStr = `SELECT 
  articles.article_id,
  articles.author,
  articles.title,
  articles.topic,
  articles.created_at,
  articles.votes,
  articles.article_img_url,
  COUNT(comments.article_id)::INT AS comment_count
FROM articles
LEFT JOIN comments ON articles.article_id = comments.article_id
GROUP BY articles.article_id`;

  const validSortQueries = [
    "article_id",
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrders = ["ASC", "DESC"];

  // sort query
  if (sort_by && !validSortQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  } else if (sort_by && validSortQueries.includes(sort_by)) {
    queryStr += ` ORDER BY ${sort_by}`;
  } else {
    queryStr += ` ORDER BY created_at`;
  }

  // order query
  if (order && validOrders.includes(order.toUpperCase())) {
    queryStr += ` ${order.toUpperCase()}`;
  } else queryStr += ` DESC`;

  return db.query(queryStr).then(({ rows }) => {
    const articles = rows;
    return articles;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else {
        const article = rows[0];
        return article;
      }
    });
};

exports.updateArticleById = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      const updatedArticle = rows[0];
      return updatedArticle;
    });
};
