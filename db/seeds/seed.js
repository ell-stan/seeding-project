const db = require("../connection");
const format = require("pg-format");
const convertTimestampToDate = require("./utils.js");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
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
    });
  /*     .then(() => {
      console.log(convertTimestampToDate(articleData));
      const articleDataConverted = convertTimestampToDate(articleData);
      const formattedArticles = articleDataConverted.map((article) => {
        return [
          article.title,
          article.topic,
          article.author,
          article.body,
          article.created_at,
          article.votes,
          article_img_url,
        ];
      });
      const insertArticlesQuery = format(``)
    }); */
};
module.exports = seed;
