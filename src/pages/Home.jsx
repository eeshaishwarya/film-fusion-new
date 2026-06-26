import React, { useState } from 'react';
import '../css/home.css';
import Header from './Header';

function Home() {
  const [movie1, setMovie1] = useState('');
  const [movie2, setMovie2] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [movie1Poster, setMovie1Poster] = useState('');
  const [movie2Poster, setMovie2Poster] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [rotatePlus, setRotatePlus] = useState(false);

  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=78ebf86582d69ef98354742f26678646&query=${query}`
      );
      const data = await res.json();

      if (!data || !Array.isArray(data.results)) {
        console.error("Invalid response from TMDb:", data);
        setSuggestions([]);
        return;
      }

      setSuggestions(data.results.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
    }
  };

  const selectMovie = (movie, setMovie, setPoster, setSuggestions) => {
    setMovie(movie.title);
    setPoster(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
    setSuggestions([]);
  };

  const generateFusion = async () => {
    setRotatePlus(true); // start rotation
    setTimeout(() => setRotatePlus(false), 1000); // stop after 1 second
    setError('');
    setRecommendations([]);
    setLoading(true);

    if (!movie1.trim() || !movie2.trim()) {
      setError('Please enter both movie titles.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/recommend?movie1=${encodeURIComponent(movie1.trim())}&movie2=${encodeURIComponent(movie2.trim())}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data.length === 0) {
        setError('No recommendations found for the given movies.');
      } else {
        setRecommendations(data.map(movie => ({
          title: movie.title,
          poster: movie.poster,
        })));
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(err.message.includes('Movie not found') ? err.message : 'Error fetching recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    const row = document.getElementById("scroll-row");
    const scrollAmount = 300;
    row.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <Header />
      
      <div className="fusion-area">

        {/* Movie 1 Section */}
        <div className="movie-section">
          <div className="movie-card">
            {movie1Poster ? <img src={movie1Poster} alt="Movie 1 Poster" /> : 'MOVIE 1'}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={movie1}
              onChange={(e) => {
                setMovie1(e.target.value);
                fetchSuggestions(e.target.value, setSuggestions1);
              }}
              placeholder="Enter movie title"
            />
            {suggestions1.length > 0 && (
              <ul className="suggestions-list">
                {suggestions1.map((m) => (
                  <li key={m.id} onClick={() => selectMovie(m, setMovie1, setMovie1Poster, setSuggestions1)}>
                    {m.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={`plus-sign ${rotatePlus ? 'rotate' : ''}`}>+</div>

        {/* Movie 2 Section */}
        <div className="movie-section">
          <div className="movie-card">
            {movie2Poster ? <img src={movie2Poster} alt="Movie 2 Poster" /> : 'MOVIE 2'}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={movie2}
              onChange={(e) => {
                setMovie2(e.target.value);
                fetchSuggestions(e.target.value, setSuggestions2);
              }}
              placeholder="Enter movie title"
            />
            {suggestions2.length > 0 && (
              <ul className="suggestions-list">
                {suggestions2.map((m) => (
                  <li key={m.id} onClick={() => selectMovie(m, setMovie2, setMovie2Poster, setSuggestions2)}>
                    {m.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <button
        className="generate-btn"
        onClick={generateFusion}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Generate Fusion'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

      {recommendations.length > 0 && (
        <div className="recommendations-scroll-wrapper">
          <button className="scroll-btn left" onClick={() => scroll(-1)}>&#10094;</button>

          <div className="recommendations" id="scroll-row">
            {recommendations.map((movie, index) => (
              <div key={index} className="recommend-card">
                <img src={movie.poster || "/images/placeholder.jpg"} alt={movie.title} />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>

          <button className="scroll-btn right" onClick={() => scroll(1)}>&#10095;</button>
        </div>
      )}
    </div>
  );
}

export default Home;