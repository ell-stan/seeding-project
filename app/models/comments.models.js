const db = require("../../db/connection.js");

exports.selectCommentsByArticleId = (id, sort_by, order) => {
  if (isNaN(id)) {
    return Promise.reject({ status: 400, msg: "Invalid article ID" });
  }

  let queryStr = `SELECT * FROM comments WHERE article_id = $1`;

  const validSortQueries = [
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
  }

  // order query
  if (order && validOrders.includes(order.toUpperCase())) {
    queryStr += ` ${order.toUpperCase()}`;
  } else queryStr += ` DESC`;

  return db.query(queryStr, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "No comments have been posted yet",
      });
    } else {
      const comments = rows;
      return comments;
    }
  });
};
