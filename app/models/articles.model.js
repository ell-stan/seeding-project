const db = require("../../db/connection.js");

exports.selectArticles = (sort_by = "created_at", order = "DESC", topic) => {
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
  const queryValues = [];

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
LEFT JOIN comments ON articles.article_id = comments.article_id`;

  // topic filter
  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  // grouping
  queryStr += ` GROUP BY articles.article_id`;

  // sort query
  if (sort_by && !validSortQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }

  // order query
  const upperCaseOrder = order ? order.toUpperCase() : "DESC";
  if (order && !validOrders.includes(upperCaseOrder)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  // sorting
  queryStr += ` ORDER BY ${sort_by} ${upperCaseOrder}`;

  return db.query(queryStr, queryValues).then(({ rows }) => {
    if (rows.length === 0 && topic) {
      return db
        .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
        .then(({ rows: topics }) => {
          if (topics.length === 0) {
            return Promise.reject({ status: 404, msg: "Topic not found" });
          } else {
            return [];
          }
        });
    } // likely best to refactor this later into a reusable function checkTopicExists() and put into topics model

    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT 
  articles.article_id,
  articles.author,
  articles.title,
  articles.topic,
  articles.body,
  articles.created_at,
  articles.votes,
  articles.article_img_url,
  COUNT(comments.article_id)::INT AS comment_count
FROM articles
LEFT JOIN comments ON articles.article_id = comments.article_id
WHERE articles.article_id = $1
GROUP BY articles.article_id;`,
      [article_id]
    )
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
