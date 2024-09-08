import { useEffect, useState } from "react";
import "./App.scss";
import { API_URL, TIMEOUT_SEC } from "./js/config";
import { timeout } from "./js/helper";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function fetchData() {
      try {
        const res = await Promise.race([
          fetch(url, { signal }),
          timeout(TIMEOUT_SEC),
        ]);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (data.Response === "False") throw new Error(data.Error);
        setData(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    setData(null);
    setError("");
    if (!url) return;
    setIsLoading(true);
    fetchData();

    return () => controller.abort();
  }, [url]);

  return { data, isLoading, error };
}

function App() {
  const [query, setQuery] = useState("");
  const [movieId, setMovieId] = useState("");

  const movieList = useFetch(query.length > 2 ? `${API_URL}&s=${query}` : null);
  const movie = useFetch(movieId ? `${API_URL}&i=${movieId}` : null);

  // useEffect(() => setMovieId(""), [query]);

  return (
    <>
      <Header
        query={query}
        onChangeHandler={setQuery}
        total={movieList.data?.Search.length || 0}
      />
      <main>
        <Movies
          list={movieList.data?.Search}
          isLoading={movieList.isLoading}
          error={movieList.error}
          clickHandler={setMovieId}
        />
        <MovieDetails
          movie={movie.data}
          isLoading={movie.isLoading}
          error={movie.error}
        />
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
  if (isLoading) return <p className="message">Loading...</p>;
  if (error) return <p className="message">Error: {error}</p>;
  if (!list) return <p className="message">Start searching by movie name</p>;
  return (
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
  );
}

function MovieDetails({ movie, isLoading, error }) {
  if (isLoading) return <p className="message">Loading...</p>;
  if (error) return <p className="message">Error: {error}</p>;
  if (!movie) return <p className="message"></p>;

  return (
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
  );
}

export default App;
