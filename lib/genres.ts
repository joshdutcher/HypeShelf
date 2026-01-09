/**
 * Genre management utilities
 */

export const INITIAL_GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Documentary",
  "Animation",
  "Fantasy",
  "Mystery",
  "Other",
] as const;

export type Genre = typeof INITIAL_GENRES[number];

// This would be extended dynamically from TMDb in a real implementation
export const getAllGenres = (): string[] => {
  return [...INITIAL_GENRES];
};
