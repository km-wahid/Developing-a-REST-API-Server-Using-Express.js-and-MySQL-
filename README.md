# Lab Report 5 — Developing a REST API Server Using Express.js and MySQL

This project demonstrates connecting Express.js to MySQL, retrieving records with SQL SELECT, inserting records with SQL INSERT, and testing both routes in a browser.

**Schema:** `database.sql` contains the teacher’s supplied SQL for `movie_info`, including all five tables and seed records. `USE movie_info;` was added to select the database before creating tables. Import it once into a fresh MySQL installation/database; it does not delete or overwrite an existing database.

## Do I need Laragon?

Laragon is optional unless your teacher specifically requires it. The application needs Node.js and a running MySQL server. Linux can run MySQL directly; Windows users can use Laragon's MySQL service. A separately installed MySQL server also works. Laragon does not replace the Express server started by `npm start`.

## Setup

1. Install Node.js 22 or newer and MySQL. On Ubuntu, MySQL can be installed with `sudo apt update` followed by `sudo apt install mysql-server`. Start it with `sudo systemctl start mysql`.
2. Open a terminal in this project and run `npm install`.
3. Import the supplied database on Ubuntu:

   ```sh
   sudo mysql < database.sql
   sudo mysql
   ```

   In the MySQL prompt, create a dedicated account. Replace the example password with your own:

   ```sql
   CREATE USER 'lab_user'@'localhost' IDENTIFIED BY 'change_this_password';
   GRANT SELECT, INSERT ON movie_info.* TO 'lab_user'@'localhost';
   EXIT;
   ```

   With a password-based MySQL installation, import using `mysql -u root -p < database.sql`, then run the account statements as an administrator. In Windows/Laragon, start MySQL and import `database.sql` through its database manager or MySQL terminal.
4. Copy `.env.example` to `.env` (`cp .env.example .env` on Linux). Set the database credentials to match your MySQL account.
5. Run `npm start`. A successful startup prints `MySQL connected. Open http://localhost:3000`.

If the connection fails, check that MySQL is running, the database has been imported, and `.env` contains the correct host, port, username, and password. `.env` is excluded from Git.

## Browser testing

1. Open `http://localhost:3000`. Click **Retrieve movies (GET)**. Expect HTTP 200 and a JSON array.
2. Enter movie ID `12`, a movie name, genre, year, rating, and an existing director ID (for example `3`). Click **Insert movie (POST)**. Expect HTTP 201 and the inserted record with the supplied movie ID.
3. Click **Retrieve movies (GET)** again. The new record should appear, demonstrating persistence in MySQL.
4. Insert the same movie ID again. Expect HTTP 409.
5. Open `http://localhost:3000/api/movies` directly to view the GET response in your browser.

The form uses browser `fetch()` for POST because typing a URL in the address bar sends a GET request. Capture your own screenshots of the successful GET and POST responses for the report.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | Browser testing page |
| GET | `/api/movies` | Execute SELECT and return movies |
| GET | `/api/directors` | Retrieve directors |
| GET | `/api/actors` | Retrieve actors |
| GET | `/api/characters` | Retrieve characters, including nullable ages |
| GET | `/api/movie-characters` | Retrieve movie–character relationships |
| POST | `/api/movies` | Validate input, execute INSERT, return the created movie |

POST accepts JSON such as:

```json
{ "Movie_ID": 12, "Movie_Name": "Example Movie", "Genre": "Drama", "Year": 2026, "IMDb_Rating": 8.1, "Director_ID": 3 }
```

## Checks

Run `npm test` after installing dependencies. The API test uses a simulated database to check HTTP behavior, validation, duplicate handling, parameterized queries, and foreign-key error handling. It does not verify a real MySQL connection. Follow the browser procedure above against MySQL for the required lab verification.

During preparation, npm installation was blocked by network restrictions and MySQL/Docker was unavailable. `npm test` was attempted but could not load Express. API checks and browser/MySQL tests remain unverified. Server, test, and browser JavaScript syntax checks passed. Do not claim successful database testing until you run it.

## Files

- `server.js`: MySQL pool, connection check, server startup.
- `app.js`: Express middleware, GET/POST routes, SQL, error handling.
- `database.sql`: supplied database, five tables, and seed records.
- `public/index.html`: browser interface for testing both API methods.
- `test/api.test.js`: automated API checks.
- `LAB_REPORT.md`: report text to complete with your identity and actual test evidence.

## GitHub and Classroom submission

Repository: https://github.com/km-wahid/Developing-a-REST-API-Server-Using-Express.js-and-MySQL-

For a fresh checkout without Git configured, run these commands inside this folder:

```sh
git init -b main
git add .
git commit -m "Complete Express and MySQL lab 5"
git remote add origin https://github.com/km-wahid/Developing-a-REST-API-Server-Using-Express.js-and-MySQL-.git
git push -u origin main
```

Commit the generated `package-lock.json` after a successful `npm install`. Never commit `.env` or `node_modules`.

Copy the repository URL, submit it in the assigned Google Classroom task, and comment your own roll number as instructed by the teacher. Check that the teacher can access the repository.

## References

- Assignment SQL: https://docs.google.com/document/d/1EwCIumCjo0q2rThvXUf5-QK5LFBCQ8qjC9i2e5BX4Wk/edit
- Express: https://expressjs.com/en/starter/hello-world/
- MySQL2 driver: https://sidorares.github.io/node-mysql2/docs
