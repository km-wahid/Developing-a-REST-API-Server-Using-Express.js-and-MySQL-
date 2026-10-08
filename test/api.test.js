import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';

test('movie API retrieves tables, validates input, and parameterizes inserts', async (t) => {
  const calls = [];
  const movie = { Movie_ID: 12, Movie_Name: 'Example', Genre: 'Drama', Year: 2026, IMDb_Rating: 8.1, Director_ID: 3 };
  const db = {
    async execute(sql, values) {
      calls.push({ sql, values });
      if (sql.startsWith('SELECT')) return [[movie]];
      if (values[0] === 1) throw Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' });
      if (values[5] === 999) throw Object.assign(new Error('foreign key'), { code: 'ER_NO_REFERENCED_ROW_2' });
      return [{ affectedRows: 1 }];
    },
  };
  const server = createApp(db).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (body) => fetch(`${url}/api/movies`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Insert movie/);
  for (const [route, table, order] of [
    ['movies', 'Movie', 'Movie_ID'], ['directors', 'Director', 'Person_ID'],
    ['actors', 'Actor', 'Person_ID'], ['characters', 'Movie_Characters', 'Character_ID'],
    ['movie-characters', 'Movie_Character_Relationship', 'Movie_ID, Character_ID'],
  ]) {
    const response = await fetch(`${url}/api/${route}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [movie]);
    assert.equal(calls.at(-1).sql, `SELECT * FROM ${table} ORDER BY ${order}`);
  }
  const before = calls.length;
  for (const body of [{}, null, { ...movie, Movie_Name: ' ' },
    { ...movie, Movie_Name: 'x'.repeat(51) }, { ...movie, Movie_ID: '12' },
    { ...movie, IMDb_Rating: 10.1 }, { ...movie, IMDb_Rating: 8.12 },
    { ...movie, Director_ID: -1 }, { ...movie, Year: 2026.5 }]) {
    assert.equal((await post(body)).status, 400);
  }
  assert.equal(calls.length, before, 'invalid input must not reach MySQL');
  const Movie_Name = "Robert'); DROP TABLE Movie; --";
  const inserted = await post({ ...movie, Movie_Name, Genre: ' Drama ' });
  assert.equal(inserted.status, 201);
  assert.deepEqual(await inserted.json(), { ...movie, Movie_Name });
  assert.equal(calls.at(-1).sql, 'INSERT INTO Movie (Movie_ID, Movie_Name, Genre, Year, IMDb_Rating, Director_ID) VALUES (?, ?, ?, ?, ?, ?)');
  assert.deepEqual(calls.at(-1).values, [12, Movie_Name, 'Drama', 2026, 8.1, 3]);
  assert.equal((await post({ ...movie, Movie_ID: 1 })).status, 409);
  assert.equal((await post({ ...movie, Director_ID: 999 })).status, 400);
  const malformed = await fetch(`${url}/api/movies`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
  });
  assert.equal(malformed.status, 400);
  assert.equal((await fetch(`${url}/missing`)).status, 404);
});
