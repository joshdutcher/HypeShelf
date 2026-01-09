import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPosterUrl,
  mapTMDbGenresToOurs,
  searchMovies,
  getMovieExternalIds,
} from "./tmdb";

describe("TMDb Utilities", () => {
  describe("getPosterUrl", () => {
    it("should return full URL for valid poster path", () => {
      const posterPath = "/abc123.jpg";
      const url = getPosterUrl(posterPath);
      expect(url).toBe("https://image.tmdb.org/t/p/w500/abc123.jpg");
    });

    it("should return null for null poster path", () => {
      const url = getPosterUrl(null);
      expect(url).toBeNull();
    });

    it("should handle poster paths with leading slash", () => {
      const url = getPosterUrl("/poster.jpg");
      expect(url).toContain("/poster.jpg");
    });
  });

  describe("mapTMDbGenresToOurs", () => {
    it("should map action genre ID (28) to Action", () => {
      const genres = mapTMDbGenresToOurs([28]);
      expect(genres).toContain("Action");
    });

    it("should map comedy genre ID (35) to Comedy", () => {
      const genres = mapTMDbGenresToOurs([35]);
      expect(genres).toContain("Comedy");
    });

    it("should map horror genre ID (27) to Horror", () => {
      const genres = mapTMDbGenresToOurs([27]);
      expect(genres).toContain("Horror");
    });

    it("should map sci-fi genre ID (878) to Sci-Fi", () => {
      const genres = mapTMDbGenresToOurs([878]);
      expect(genres).toContain("Sci-Fi");
    });

    it("should map multiple genre IDs", () => {
      const genres = mapTMDbGenresToOurs([28, 35, 27]); // Action, Comedy, Horror
      expect(genres).toContain("Action");
      expect(genres).toContain("Comedy");
      expect(genres).toContain("Horror");
    });

    it("should remove duplicates when multiple IDs map to same genre", () => {
      const genres = mapTMDbGenresToOurs([28, 12]); // Action + Adventure (both map to Action)
      expect(genres).toEqual(["Action"]);
    });

    it("should filter out unmapped genre IDs", () => {
      const genres = mapTMDbGenresToOurs([99999]); // Unknown ID
      expect(genres).toEqual([]);
    });

    it("should return empty array for empty input", () => {
      const genres = mapTMDbGenresToOurs([]);
      expect(genres).toEqual([]);
    });
  });

  describe("searchMovies", () => {
    beforeEach(() => {
      // Reset fetch mock before each test
      global.fetch = vi.fn();
    });

    it("should return empty array when API key is not configured", async () => {
      // Temporarily remove API key
      const originalKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      delete process.env.NEXT_PUBLIC_TMDB_API_KEY;

      const results = await searchMovies("Inception");
      expect(results).toEqual([]);

      // Restore API key
      if (originalKey) {
        process.env.NEXT_PUBLIC_TMDB_API_KEY = originalKey;
      }
    });

    it("should return empty array for empty query", async () => {
      const results = await searchMovies("");
      expect(results).toEqual([]);
    });

    it("should return empty array for whitespace-only query", async () => {
      const results = await searchMovies("   ");
      expect(results).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const results = await searchMovies("Test Movie");
      expect(results).toEqual([]);
    });

    it("should handle non-OK responses", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const results = await searchMovies("Test Movie");
      expect(results).toEqual([]);
    });

    it("should limit results to 5 movies", async () => {
      const mockResults = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        title: `Movie ${i}`,
      }));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockResults }),
      });

      const results = await searchMovies("Popular");
      expect(results.length).toBe(5);
    });
  });

  describe("getMovieExternalIds", () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it("should return null when API key is not configured", async () => {
      const originalKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      delete process.env.NEXT_PUBLIC_TMDB_API_KEY;

      const result = await getMovieExternalIds(123);
      expect(result).toBeNull();

      if (originalKey) {
        process.env.NEXT_PUBLIC_TMDB_API_KEY = originalKey;
      }
    });

    it("should return IMDB URL when imdb_id exists", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ imdb_id: "tt1375666" }),
      });

      const result = await getMovieExternalIds(27205);
      expect(result).toBe("https://www.imdb.com/title/tt1375666/");
    });

    it("should return null when imdb_id does not exist", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await getMovieExternalIds(123);
      expect(result).toBeNull();
    });

    it("should return null on API error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await getMovieExternalIds(123);
      expect(result).toBeNull();
    });
  });
});
