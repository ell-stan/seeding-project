const db = require("../../db/connection.js");

exports.selectCommentsByArticleId = (article_id, sort_by, order) => {
  let queryStr = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`;

  /* const validSortQueries = [
    "comment_id",
    "article_id",
    "votes",
    "author",
    "created_at",
  ];
  const validOrders = ["ASC", "DESC"];

  // sort query
  if (sort_by && !validSortQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  } else if (sort_by && validSortQueries.includes(sort_by)) {
    queryStr += ` ORDER BY ${sort_by}`;
  } else { 
  queryStr += ` ORDER BY created_at`;
  /* }

  // order query
  if (order && validOrders.includes(order.toUpperCase())) {
    queryStr += ` ${order.toUpperCase()}`;
  } else queryStr += ` DESC`; */

  return db.query(queryStr, [article_id]).then(({ rows: comments }) => {
    if (comments.length === 0) {
      return db
        .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
        .then(({ rows: articles }) => {
          if (articles.length === 0) {
            return Promise.reject({ status: 404, msg: "Article not found" });
          } else {
            return [];
          }
        });
    } else {
      return comments;
    }
  });
};

exports.insertCommentByArticleId = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
      [article_id, username, body]
    )
    .then(({ rows }) => {
      const comment = rows[0];
      return comment;
    });
};
