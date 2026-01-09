/**
 * Shared constants for HypeShelf
 */

// Initial predefined genres
// This list can dynamically expand when TMDb returns new genres
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

// Field validation constraints
export const VALIDATION = {
  TITLE_MAX_LENGTH: 100,
  BLURB_MAX_LENGTH: 500,
  LINK_MAX_LENGTH: 2000,
  GENRES_MIN_COUNT: 1,
} as const;

// Special user IDs
export const SYSTEM_USER_ID = "system";

// Admin email addresses (auto-assigned admin role)
// In production, this would come from environment variables
export const ADMIN_EMAILS = ["admin@example.com"];

// User roles
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
