import { useEffect, useState } from "react";
import "./App.scss";
import { API_URL, TIMEOUT_SEC } from "./js/config";
import { timeout } from "./js/helper";

function App() {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [movieId, setMovieId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setList([]);
    setMovieId("");
    if (query.length < 3) return;
    setIsLoading(true);
    searchMovies(query);
  }, [query]);

  async function searchMovies(query) {
    try {
      const res = await Promise.race([
        fetch(`${API_URL}&s=${query}`),
        timeout(TIMEOUT_SEC),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.Response === "False") throw new Error(data.Error);
      setList(data.Search);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header query={query} onChangeHandler={setQuery} total={list.length} />
      <main>
        <Movies
          list={list}
          isLoading={isLoading}
          error={error}
          clickHandler={setMovieId}
        />
        <MovieDetails movieId={movieId} />
      </main>
    </>
  );
}

function Header({ query, onChangeHandler, total }) {
  return (
    <header className="header">
      <h1>🍿 usePopcorn</h1>
      <input
        name="query"
        type="text"
        value={query}
        onChange={(e) => onChangeHandler(e.target.value)}
      />
      <p className="result-msg">Found {total} results</p>
    </header>
  );
}

function Movies({ list, isLoading, error, clickHandler }) {
  return (
    <>
      {isLoading ? <p className="message">Loading...</p> : null}
      {error ? <p className="message">Error: {error}</p> : null}
      {list.length ? (
        <ul className="movies">
          {list.map((movie, i) => (
            <li
              className="movie-preview"
              onClick={() => clickHandler(movie.imdbID)}
              key={i}
            >
              <img src={movie.Poster} alt={movie.Title} />
              <div>
                <h4>{movie.Title}</h4>
                <p>{movie.Year}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function MovieDetails({ movieId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [movie, setMovie] = useState({});

  useEffect(() => {
    setError("");
    setMovie({});
    if (!movieId) return;
    setIsLoading(true);
    getMovie(movieId);
  }, [movieId]);

  async function getMovie(movieId) {
    try {
      const res = await Promise.race([
        fetch(`${API_URL}&i=${movieId}`),
        timeout(TIMEOUT_SEC),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.Response === "False") throw new Error(data.Error);
      console.log(data);

      setMovie(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading ? <p className="message">Loading...</p> : null}
      {error ? <p className="message">Error: {error}</p> : null}
      {Object.entries(movie).length ? (
        <article className="movie">
          <header>
            <img src={movie.Poster} alt={movie.Title} />
            <div className="overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>{movie.imdbRating} ⭐ IMDb Rating</p>
            </div>
          </header>
          <section>
            <p>{movie.Plot}</p>
            <p>Starring {movie.Actors}</p>
            <p>Directed By {movie.Director}</p>
          </section>
        </article>
      ) : null}
    </>
  );
}

export default App;
