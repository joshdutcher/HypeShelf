"use client";

import { useState, useEffect, useRef } from "react";
import {
  searchMovies,
  getPosterUrl,
  mapTMDbGenresToOurs,
  getMovieExternalIds,
  TMDbMovie,
} from "@/lib/tmdb";

interface MovieAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onMovieSelect: (movie: {
    title: string;
    genres: string[];
    posterUrl: string | null;
    blurb: string;
    link: string | null;
    tmdbId: number;
  }) => void;
}

export function MovieAutocomplete({
  value,
  onChange,
  onMovieSelect,
}: MovieAutocompleteProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<TMDbMovie[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.trim().length >= 2) {
        setIsSearching(true);
        const movies = await searchMovies(value);
        setResults(movies);
        setShowResults(true);
        setIsSearching(false);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMovieClick = async (movie: TMDbMovie) => {
    // Get IMDB link
    const imdbLink = await getMovieExternalIds(movie.id);

    onMovieSelect({
      title: movie.title,
      genres: mapTMDbGenresToOurs(movie.genre_ids),
      posterUrl: getPosterUrl(movie.poster_path),
      blurb: movie.overview,
      link: imdbLink,
      tmdbId: movie.id,
    });

    setShowResults(false);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleMovieClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        setShowResults(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Start typing a movie title..."
          maxLength={100}
          required
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-80 overflow-y-auto">
          {results.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => handleMovieClick(movie)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex gap-3">
                {movie.poster_path ? (
                  <img
                    src={getPosterUrl(movie.poster_path) || ""}
                    alt={movie.title}
                    className="h-16 w-11 object-cover rounded"
                  />
                ) : (
                  <div className="h-16 w-11 bg-gray-200 rounded flex items-center justify-center text-xs">
                    🎬
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {movie.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : "N/A"}
                  </div>
                  {movie.overview && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {movie.overview}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && !isSearching && results.length === 0 && value.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg px-4 py-3 text-sm text-gray-600">
          No movies found. You can still add it manually.
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500">
        Search TMDb or type manually • {value.length}/100 characters
      </p>
    </div>
  );
}
