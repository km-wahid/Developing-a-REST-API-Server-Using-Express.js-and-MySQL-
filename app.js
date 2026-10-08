import express from 'express';
import { fileURLToPath } from 'node:url';

export function createApp(db) {
  const app = express();
  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));

  // Fixed queries keep table names separate from user input.
  const queries = {
    movies: 'SELECT * FROM Movie ORDER BY Movie_ID',
    directors: 'SELECT * FROM Director ORDER BY Person_ID',
    actors: 'SELECT * FROM Actor ORDER BY Person_ID',
    characters: 'SELECT * FROM Movie_Characters ORDER BY Character_ID',
    'movie-characters': 'SELECT * FROM Movie_Character_Relationship ORDER BY Movie_ID, Character_ID',
  };
  for (const [route, sql] of Object.entries(queries)) {
    app.get(`/api/${route}`, async (req, res) => {
      const [rows] = await db.execute(sql);
      res.json(rows);
    });
  }

  app.post('/api/movies', async (req, res) => {
    const { Movie_ID, Movie_Name, Genre, Year, IMDb_Rating, Director_ID } = req.body ?? {};
    const validId = (value) => Number.isInteger(value) && value > 0 && value <= 2147483647;
    const validText = (value, max) => typeof value === 'string' && value.trim() && Array.from(value.trim()).length <= max;
    if (!validId(Movie_ID) || !validId(Director_ID) ||
        !validText(Movie_Name, 50) || !validText(Genre, 30) ||
        !Number.isInteger(Year) || Year < 1 || Year > 9999 ||
        typeof IMDb_Rating !== 'number' || !Number.isFinite(IMDb_Rating) ||
        IMDb_Rating < 0 || IMDb_Rating > 10 ||
        Math.abs(IMDb_Rating * 10 - Math.round(IMDb_Rating * 10)) > 1e-9) {
      return res.status(400).json({ error: 'Provide positive integer Movie_ID and Director_ID, Movie_Name (1–50 characters), Genre (1–30), Year (1–9999), and IMDb_Rating (0–10, at most one decimal place).' });
    }
    const movie = { Movie_ID, Movie_Name: Movie_Name.trim(), Genre: Genre.trim(), Year, IMDb_Rating, Director_ID };
    await db.execute(
      'INSERT INTO Movie (Movie_ID, Movie_Name, Genre, Year, IMDb_Rating, Director_ID) VALUES (?, ?, ?, ?, ?, ?)',
      [movie.Movie_ID, movie.Movie_Name, movie.Genre, movie.Year, movie.IMDb_Rating, movie.Director_ID]
    );
    res.status(201).json(movie);
  });

  app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
  app.use((error, req, res, next) => {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Movie_ID already exists. Choose an unused ID.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Director_ID must reference an existing director.' });
    }
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON.' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body is too large.' });
    }
    console.error('Database request failed:', error.code ?? error.message);
    res.status(500).json({ error: 'Unable to complete the request.' });
  });
  return app;
}
