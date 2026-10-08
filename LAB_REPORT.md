# Lab Report 5

**Title:** Developing a REST API Server Using Express.js and MySQL

**Student name:** [Enter your name]

**Roll number:** [Enter your roll number]

**Course/section:** [Enter your course and section]

**Date performed:** [Enter actual date]

## Objective

Develop a Node.js application with Express.js, connect it to MySQL using a database driver, execute SQL queries to retrieve and insert records, and test the API using a browser.

## Tools

Node.js, npm, Express.js, MySQL, the mysql2 driver, a web browser, and Git/GitHub. Laragon may supply MySQL on Windows; it is optional for the application itself.

## Database

The supplied `movie_info` database contains `Director`, `Actor`, `Movie`, `Movie_Characters`, and `Movie_Character_Relationship`. Movies reference directors, while the relationship table connects movies and characters. Character ages can be NULL. The supplied data includes 8 directors, 7 actors, 11 movies, 39 characters, and 42 relationships.

The teacher’s SQL is preserved in `database.sql`, with `USE movie_info;` added after database creation.

## Procedure

1. Configure a Node.js project in `package.json` and install Express.js and mysql2 using npm.
2. Import `database.sql` into MySQL and configure the connection in `.env`.
3. Create a MySQL connection pool in `server.js` and execute `SELECT 1` before starting Express.
4. Configure JSON parsing and the browser page in `app.js`.
5. Implement `GET /api/movies` to execute:

   ```sql
   SELECT * FROM Movie ORDER BY Movie_ID;
   ```

6. Implement `POST /api/movies` to validate the JSON fields and execute:

   ```sql
   INSERT INTO Movie (Movie_ID, Movie_Name, Genre, Year, IMDb_Rating, Director_ID)
   VALUES (?, ?, ?, ?, ?, ?);
   ```

   The driver binds the submitted values to placeholders, keeping user input separate from SQL syntax.
7. Add GET routes for directors, actors, characters, and movie–character relationships.
8. Start the application with `npm start`, open `http://localhost:3000`, and test retrieval and insertion through the page.

## Expected results and evidence

| Test | Expected result | Actual result |
| --- | --- | --- |
| Connect to MySQL | Server starts after successful connection | [Record after running] |
| Retrieve movies | HTTP 200 with JSON records | [Attach browser screenshot] |
| Insert a valid movie | HTTP 201 with supplied movie ID | [Attach browser screenshot] |
| Retrieve after insertion | Inserted movie appears in the list | [Attach browser screenshot] |
| Reuse a movie ID | HTTP 409 with an error message | [Record after running] |
| Missing or invalid fields | HTTP 400 with an error message | [Record after running] |

Dependencies were installed and the automated API test passed using a simulated database. Starting the development server failed with `ECONNREFUSED` at `127.0.0.1:3306`. Real MySQL and browser testing remain pending. Expected results above are not observed database results.

## Discussion

Express maps incoming HTTP requests to route handlers. The MySQL driver executes queries and returns their results. The GET handler returns database rows as JSON. The POST handler validates input, inserts a record using parameters, and returns HTTP 201. Duplicate movie IDs return HTTP 409; nonexistent director IDs return HTTP 400, and database errors receive a generic HTTP 500 response without exposing database details.

## Conclusion

The implementation demonstrates the structure of an Express.js REST API connected to MySQL. Successful execution must be confirmed through the browser tests and the actual results added before submitting this report.

## Submission

**GitHub repository:** https://github.com/km-wahid/Developing-a-REST-API-Server-Using-Express.js-and-MySQL-

Submit this link in Google Classroom and comment your roll number on the assignment as instructed.
