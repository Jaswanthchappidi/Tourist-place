import React, { useState, useEffect } from 'react';
import './App.css'; // Import the external CSS file

// --- Helper Components for UI ---

const SearchIcon = () => (
  <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const MapPinIcon = () => (
    <svg className="map-pin-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const Loader = () => (
    <div className="loader-container">
        <div className="loader-spinner"></div>
    </div>
);

// --- Redesigned PlaceCard Component (Updated with Google Maps Link) ---
const PlaceCard = ({ place }) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.location.coordinates[1]},${place.location.coordinates[0]}`;

    return (
        <div className="place-card fade-in">
            <img src={place.imageUrl} alt={place.name} className="place-card-image" />
            <div className="place-card-content">
                <h2 className="place-card-title">{place.name}</h2>
                <p className="place-card-description">{place.description}</p>
                <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="place-card-location-link"
                >
                    <div className="place-card-location">
                        <MapPinIcon />
                        <span>{place.location.coordinates[1].toFixed(4)}° N, {place.location.coordinates[0].toFixed(4)}° E</span>
                    </div>
                </a>
            </div>
        </div>
    );
};

// The main App component
export default function App() {
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const BACKEND_URL = 'http://localhost:5002';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError('');
    setPlace(null);
    setHasSearched(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/places/search?query=${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch data');
      }
      
      setPlace(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // This effect runs once on mount. You can use it to load a default location.
  }, []);


  return (
    <div className="app-container">
      <div className="main-content">
        
        <header className="app-header">
          <h1 className="header-title">
            Find Your Next Adventure
          </h1>
          <p className="header-subtitle">
            Enter a city or village name to discover amazing tourist spots with their exact locations.
          </p>
        </header>

        <div className="search-container-sticky">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-icon-container">
                <SearchIcon />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Agra, Jaipur, Goa..."
              className="search-input"
            />
            <button type="submit" className="search-button">
                Search
            </button>
          </form>
        </div>

        <div className="results-container">
          {isLoading && <Loader />}
          {error && <div className="error-box fade-in">{error}</div>}
          {place && <PlaceCard place={place} />}
          {!hasSearched && !isLoading && !place && !error && (
            <div className="initial-message">
              <p>Start by searching for a location above!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
