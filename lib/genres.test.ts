import { describe, it, expect } from "vitest";
import { getAllGenres, INITIAL_GENRES } from "./genres";

describe("Genre Utilities", () => {
  describe("getAllGenres", () => {
    it("should return all initial genres", () => {
      const genres = getAllGenres();
      expect(genres).toEqual(INITIAL_GENRES);
    });

    it("should return an array of strings", () => {
      const genres = getAllGenres();
      expect(Array.isArray(genres)).toBe(true);
      genres.forEach((genre) => {
        expect(typeof genre).toBe("string");
      });
    });

    it("should include expected genres", () => {
      const genres = getAllGenres();
      expect(genres).toContain("Action");
      expect(genres).toContain("Comedy");
      expect(genres).toContain("Drama");
      expect(genres).toContain("Horror");
      expect(genres).toContain("Sci-Fi");
    });

    it("should return at least 10 genres", () => {
      const genres = getAllGenres();
      expect(genres.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("INITIAL_GENRES", () => {
    it("should not contain duplicates", () => {
      const uniqueGenres = new Set(INITIAL_GENRES);
      expect(uniqueGenres.size).toBe(INITIAL_GENRES.length);
    });

    it("should have 'Other' as fallback genre", () => {
      expect(INITIAL_GENRES).toContain("Other");
    });
  });
});
