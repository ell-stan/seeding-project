const db = require("../../db/connection.js");

exports.selectArticleById = (id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      } else {
        const article = rows[0];
        return article;
      }
    });
};
