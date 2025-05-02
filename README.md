# Backend Seeding Project

[Hosted version](https://backend-seeding-project.onrender.com/api)

This lightweight backend powers a Reddit-style app, enabling users to browse and interact with articles and comments by topic.

Built with **Node.js**, **Express**, and **PostgreSQL**, it offers a RESTful API with features like:

- Viewing, filtering, and sorting articles
- Fetching and posting article comments
- Retrieving topics and users
- Comprehensive error handling

Tested with **Jest** and **Supertest** for reliable performance.

## Minimum version requirements

- **Node.js:**
  - 23.9.0
- **Postgres:**
  - 16.8

## Setup instructions

1. Clone the repository:
   `git clone https://github.com/ell-stan/seeding-project`
   `cd seeding-project`

2. Create the environment files for the test and development databases:

   - **.env.test**
     `PGDATABASE=nc_news_test`

   - **.env.development**
     `PGDATABASE=nc_news`

3. Install dependencies:
   `npm install`

4. Seed the database:
   `npm run seed`

## Running locally

`npm start`
The server will run at http://localhost:9090

## Running tests

- To run all tests:
  `npm test`

- To run a specific test file:
  `npm testfilename.js`
