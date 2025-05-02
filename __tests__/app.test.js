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

  test("200: Responds with an array of article objects when topic query is provided, and is filtered correctly", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("200: Responds with an array of article objects when topic query, sort and order query are provided, and returns the correct result", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=title&order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        expect(articles).toBeSortedBy("title");
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("200: Responds with an empty array if topic exists, but has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toEqual([]);
      });
  });

  test("400: Responds with an error message if sort query is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid-query")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid sort query");
      });
  });

  test("400: Responds with an error message if order query is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=invalid-query")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid order query");
      });
  });

  test("400: Responds with an error message if one query parameter is misspelled", () => {
    return request(app)
      .get("/api/articles?szxort_by=votes&order=ASC")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid query parameter: szxort_by");
      });
  });

  test("400: Responds with an error message if two query parameters are misspelled", () => {
    return request(app)
      .get("/api/articles?szxort_by=votes&ordering=ASC")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid query parameters: szxort_by, ordering");
      });
  });

  test("400: Responds with an error message if all query parameters are misspelled", () => {
    return request(app)
      .get("/api/articles?yopic=mitch&szxort_by=votes&ordering=ASC")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          "Invalid query parameters: yopic, szxort_by, ordering"
        );
      });
  });

  test("400: Responds with error message if topic format is invalid", () => {
    return request(app)
      .get("/api/articles?topic=!%^")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid topic format");
      });
  });

  test("400: Responds with an error message if the provided topic is invalid, but sort & order queries are specified", () => {
    return request(app)
      .get("/api/articles?topic=invalid!£format&sort_by=votes&order=desc")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid topic format");
      });
  });

  test("404: Responds with an error message if the provided topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=not-a-topic")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Topic not found");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an array of user objects with the correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toStrictEqual({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });

  test("404: Responds with an error if the path name is spelled incorrectly", () => {
    return request(app)
      .get("/api/userz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path does not exist");
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
        expect(msg).toBe("Invalid article ID");
      });
  });

  test("404: Responds with an error message if article of given valid id does not exist", () => {
    return request(app)
      .get("/api/articles/10000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
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
            article_id: 1,
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

  test("201: Responds with an empty array if no comments exist for the given article_id", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(201)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });

  test("400: Responds with an error message if article_id is invalid", () => {
    return request(app)
      .get("/api/articles/not-a-valid-id/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid article ID");
      });
  });

  test("404: Responds with an error message if the given article_id is valid, but the article does not exist", () => {
    return request(app)
      .get("/api/articles/10000/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with the posted comment object containing the correct properties if the username (author) exists", () => {
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
        expect(msg).toBe("Missing fields: username, body");
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
        expect(msg).toBe("Missing field: username");
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
        expect(msg).toBe(
          "Username does not exist. Please create an account to post a comment"
        );
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with the updated article object with all of its required properties when given a valid article ID", () => {
    const newVote = 5;
    const patchInput = { inc_votes: newVote };
    return request(app)
      .patch("/api/articles/1")
      .send(patchInput)
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toStrictEqual({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: 105,
          article_img_url: expect.any(String),
        });
      });
  });

  test("400: Responds with an error message if input does not contain the correct key", () => {
    const newVote = 5;
    const patchInput = { wrong_key: newVote };
    return request(app)
      .patch("/api/articles/1")
      .send(patchInput)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Missing 'inc_votes' key");
      });
  });

  test("400: Responds with an error message if input does not contain the correct value type", () => {
    const newVote = "not a number";
    const patchInput = { inc_votes: newVote };
    return request(app)
      .patch("/api/articles/1")
      .send(patchInput)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid value for 'inc_votes': expected a number");
      });
  });

  test("400: Responds with an error message if given article_id is invalid", () => {
    const newVote = 5;
    const patchInput = { inc_votes: newVote };
    return request(app)
      .patch("/api/articles/not-a-valid-id")
      .send(patchInput)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid article ID");
      });
  });

  test("404: Responds with an error message if provided article_id is valid, but the article does not exist", () => {
    const newVote = 5;
    const patchInput = { inc_votes: newVote };
    return request(app)
      .patch("/api/articles/10000")
      .send(patchInput)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with the status and no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });

  test("400: Responds with an error message when given an invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/not-a-valid-id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid comment ID");
      });
  });

  test("404: Responds with an error message if a given comment_id is valid but comment does not exist", () => {
    return request(app)
      .delete("/api/comments/10000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment not found");
      });
  });
});

describe("ANY /not-a-path", () => {
  test("404: Responds with an error message if path is not found", () => {
    return request(app)
      .get("/not-a-path")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Path does not exist");
      });
  });
});
