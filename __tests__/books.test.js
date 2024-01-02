process.env.NODE_ENV = "test"

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '123432122',
        'https://amazon.com/taco',
        'Elie',
        'English',
        100,
        'Nothing publishers',
        'my first book', 2008)
      RETURNING isbn`);
    book_isbn = result.rows[0].isbn
});

describe("GET /books", function() {
    test("gets a list of 1 book", async function() {
        const response = await request(app).get(`/books`);
        const books = response.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
        expect(books[0]).toHaveProperty("title");
    })
})

describe("GET /books/:isbn", function() {
    test("gets info on one book", async function () {
        const response = await request(app).get(`/books/${book_isbn}`);
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });
    test("404 response if can't find book", async function() {
        const response = await request(app).get(`/books/123`)
        expect(response.statusCode).toBe(404);
    });
});

describe("POST /books", function() {
    test("creates new book", aync function() {
        const response = await request(app)
            .post(`/books`)
            .send({
            isbn: '32794782',
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "amazing times",
            year: 2000
            });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty("isbn");
  });
    })
})

describe("PUT /books/id", function () {
    test("Updates a single book", async function () {
        const response = await request(app)
        .put(`/books/${book_isbn}`)
        .send({
          amazon_url: "https://taco.com",
          author: "mctest",
          language: "english",
          pages: 1000,
          publisher: "yeah right",
          title: "UPDATED BOOK",
          year: 2000
        });
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.title).toBe("UPDATED BOOK");
  });
})

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
    await db.end();
})
