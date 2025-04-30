const endpointsJson = require("../endpoints.json");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../app.js");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end;
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects that have slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of article objects with the correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).toStrictEqual({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });

  test("200: Articles are sorted by date in descending order if no query is provided", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: Responds with an array of article objects sorted correctly when a sort and order query are specified", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("comment_count");
      });
  });

  test("200: Responds with an array of article objects in descending order by default when only sort_by is specified", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("comment_count", { descending: true });
      });
  });

  test("400: Responds with an error message if sort query is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid-query")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Invalid sort query");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article object with all of its required properties when given a valid article ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("400: Responds with an error message if given an invalid article ID", () => {
    return request(app)
      .get("/api/articles/not-a-valid-id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Bad request");
      });
  });

  test("404: Responds with an error message if article of given valid id does not exist", () => {
    return request(app)
      .get("/api/articles/10000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Article not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments for the given article_id with the correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toStrictEqual({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });

  test("200: Comments are sorted by date in descending order if no query is provided", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("400: Responds with an error message if article_id is invalid", () => {
    return request(app)
      .get("/api/articles/not-a-valid-id/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Invalid article ID");
      });
  });

  test("404: Responds with an error message if no comments exist for the given article_id", () => {
    return request(app)
      .get("/api/articles/10000/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("No comments have been posted yet");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test.only("201: Responds with the posted comment object containing the correct properties if the username (author) exists", () => {
    const commentInput = { username: "butter_bridge", body: "testComment" };
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentInput)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toStrictEqual({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "testComment",
          article_id: expect.any(Number),
        });
      });
  });

  test("400: Responds with an error message if the provided input does not contain the correct keys", () => {
    const commentInput = {
      notAUsername: "butter_bridge",
      notABody: "testComment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentInput)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Missing fields: username, body");
      });
  });

  test("400: Responds with an error message if the provided input has only one correct key", () => {
    const commentInput = {
      notAUsername: "butter_bridge",
      body: "testComment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentInput)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Missing field: username");
      });
  });

  test("404: Responds with an error message if the user does not exist", () => {
    const commentInput = {
      username: "testUser",
      body: "testComment",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(commentInput)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual(
          "Username does not exist. Please create an account to post a comment"
        );
      });
  });
});

describe("ANY /not-a-path", () => {
  test("404: Responds with an error message if path is not found", () => {
    return request(app)
      .get("/not-a-path")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Path does not exist");
      });
  });
});
