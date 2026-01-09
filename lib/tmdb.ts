/**
 * TMDb (The Movie Database) API utilities
 *
 * API Documentation: https://developers.themoviedb.org/3
 */

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  genre_ids: number[];
  release_date: string;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

// TMDb genre ID to our genre name mapping
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Action", // Adventure → Action
  16: "Animation",
  35: "Comedy",
  80: "Thriller", // Crime → Thriller
  99: "Documentary",
  18: "Drama",
  10751: "Other", // Family → Other
  14: "Fantasy",
  36: "Drama", // History → Drama
  27: "Horror",
  10402: "Other", // Music → Other
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "Other", // TV Movie → Other
  53: "Thriller",
  10752: "Action", // War → Action
  37: "Action", // Western → Action
};

/**
 * Search for movies by title
 */
export async function searchMovies(query: string): Promise<TMDbMovie[]> {
  if (!TMDB_API_KEY) {
    console.warn("TMDb API key not configured");
    return [];
  }

  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=en-US&page=1&include_adult=false`
    );

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.slice(0, 5); // Return top 5 results
  } catch (error) {
    console.error("Failed to search movies:", error);
    return [];
  }
}

/**
 * Get movie details by ID
 */
export async function getMovieDetails(movieId: number) {
  if (!TMDB_API_KEY) {
    console.warn("TMDb API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get movie details:", error);
    return null;
  }
}

/**
 * Get IMDB ID for a movie
 */
export async function getMovieExternalIds(movieId: number) {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/external_ids?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.imdb_id
      ? `https://www.imdb.com/title/${data.imdb_id}/`
      : null;
  } catch (error) {
    console.error("Failed to get external IDs:", error);
    return null;
  }
}

/**
 * Get poster URL for a movie
 */
export function getPosterUrl(posterPath: string | null): string | null {
  return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : null;
}

/**
 * Convert TMDb genre IDs to our genre names
 */
export function mapTMDbGenresToOurs(genreIds: number[]): string[] {
  const genres = genreIds
    .map((id) => GENRE_MAP[id])
    .filter((genre): genre is string => !!genre);

  // Remove duplicates and return
  return Array.from(new Set(genres));
}
