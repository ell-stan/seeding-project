const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createReference } = require("./utils.js");

const seed = ({ topicData, userData, articleData, commentData }) => {
  // drop tables
  return (
    db
      .query(`DROP TABLE IF EXISTS comments`)
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS articles`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS users`);
      })
      .then(() => {
        return db.query(`DROP TABLE IF EXISTS topics`);
      })
      // create tables
      .then(() => {
        return db.query(`CREATE TABLE topics (
      slug VARCHAR PRIMARY KEY,
      description VARCHAR(300),
      img_url VARCHAR(1000)
      )`);
      })
      .then(() => {
        return db.query(`CREATE TABLE users (
        username VARCHAR(500) UNIQUE PRIMARY KEY,
        name VARCHAR(200),
        avatar_url VARCHAR(1000)
        )`);
      })
      .then(() => {
        return db.query(`CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        topic VARCHAR(300) REFERENCES topics(slug) NOT NULL,
        author VARCHAR(500) REFERENCES users(username) NOT NULL,
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        votes INT DEFAULT 0,
        article_img_url VARCHAR(1000)
        )`);
      })
      .then(() => {
        return db.query(`CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INT REFERENCES articles(article_id),
        body TEXT,
        votes INT DEFAULT 0,
        author VARCHAR(500) REFERENCES users(username),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
      })
      // insert data
      .then(() => {
        const formattedTopics = topicData.map((topic) => {
          return [topic.slug, topic.description, topic.img_url];
        });
        const insertTopicsQuery = format(
          `INSERT INTO topics (slug, description, img_url) VALUES %L`,
          formattedTopics
        );
        return db.query(insertTopicsQuery);
      })
      .then(() => {
        const formattedUsers = userData.map((user) => {
          return [user.username, user.name, user.avatar_url];
        });
        const insertUsersQuery = format(
          `INSERT INTO users (username, name, avatar_url) VALUES %L`,
          formattedUsers
        );
        return db.query(insertUsersQuery);
      })
      .then(() => {
        const formattedArticles = articleData.map((article) => {
          const convertedArticle = convertTimestampToDate(article);
          return [
            convertedArticle.title,
            convertedArticle.topic,
            convertedArticle.author,
            convertedArticle.body,
            convertedArticle.created_at,
            convertedArticle.votes,
            convertedArticle.article_img_url,
          ];
        });
        const insertArticlesQuery = format(
          `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;`,
          formattedArticles
        );
        return db.query(insertArticlesQuery);
      })
      .then((result) => {
        const articlesReferenceObject = createReference(result.rows);
        const formattedComments = commentData.map((comment) => {
          const convertedComments = convertTimestampToDate(comment);
          return [
            articlesReferenceObject[comment.article_title],
            convertedComments.body,
            convertedComments.votes,
            convertedComments.author,
            convertedComments.created_at,
          ];
        });
        const insertCommentsQuery = format(
          `INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L`,
          formattedComments
        );
        return db.query(insertCommentsQuery);
      })
  );
};
module.exports = seed;
