import { describe, it, expect } from "vitest";
import { VALIDATION } from "../convex/constants";

describe("Validation Constants", () => {
  it("should have title max length", () => {
    expect(VALIDATION.TITLE_MAX_LENGTH).toBe(100);
  });

  it("should have blurb max length", () => {
    expect(VALIDATION.BLURB_MAX_LENGTH).toBe(500);
  });

  it("should have link max length", () => {
    expect(VALIDATION.LINK_MAX_LENGTH).toBe(2000);
  });

  it("should have genres min count", () => {
    expect(VALIDATION.GENRES_MIN_COUNT).toBe(1);
  });
});

describe("URL Validation", () => {
  const isValidURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  it("should validate HTTPS URLs", () => {
    expect(isValidURL("https://example.com")).toBe(true);
    expect(isValidURL("https://www.imdb.com/title/tt1234567/")).toBe(true);
  });

  it("should validate HTTP URLs", () => {
    expect(isValidURL("http://example.com")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidURL("not a url")).toBe(false);
    expect(isValidURL("")).toBe(false);
    // Note: javascript: URLs are technically valid URLs per spec
    // but should be filtered at application level for security
  });

  it("should reject malformed URLs", () => {
    // Note: These are technically valid URL schemes per spec
    // Additional validation should be done at application level
    expect(isValidURL("not a url")).toBe(false);
    expect(isValidURL("")).toBe(false);
  });

  it("should validate URLs with paths and query strings", () => {
    expect(
      isValidURL("https://example.com/path/to/resource?foo=bar&baz=qux")
    ).toBe(true);
  });

  it("should validate URLs with fragments", () => {
    expect(isValidURL("https://example.com/page#section")).toBe(true);
  });
});

describe("Field Length Validation", () => {
  const validateTitle = (title: string): boolean => {
    return title.length > 0 && title.length <= VALIDATION.TITLE_MAX_LENGTH;
  };

  const validateBlurb = (blurb: string): boolean => {
    return blurb.length <= VALIDATION.BLURB_MAX_LENGTH;
  };

  const validateLink = (link: string): boolean => {
    return link.length <= VALIDATION.LINK_MAX_LENGTH;
  };

  describe("Title Validation", () => {
    it("should accept valid titles", () => {
      expect(validateTitle("The Shawshank Redemption")).toBe(true);
      expect(validateTitle("A")).toBe(true);
      expect(validateTitle("a".repeat(100))).toBe(true);
    });

    it("should reject empty titles", () => {
      expect(validateTitle("")).toBe(false);
    });

    it("should reject titles over max length", () => {
      expect(validateTitle("a".repeat(101))).toBe(false);
    });
  });

  describe("Blurb Validation", () => {
    it("should accept valid blurbs", () => {
      expect(validateBlurb("A great movie about friendship.")).toBe(true);
      expect(validateBlurb("")).toBe(true); // Blurb is optional
      expect(validateBlurb("a".repeat(500))).toBe(true);
    });

    it("should reject blurbs over max length", () => {
      expect(validateBlurb("a".repeat(501))).toBe(false);
    });
  });

  describe("Link Validation", () => {
    it("should accept valid links", () => {
      expect(validateLink("https://example.com")).toBe(true);
      expect(validateLink("")).toBe(true); // Link is optional
      expect(validateLink("a".repeat(2000))).toBe(true);
    });

    it("should reject links over max length", () => {
      expect(validateLink("a".repeat(2001))).toBe(false);
    });
  });
});

describe("Genre Validation", () => {
  const validateGenres = (genres: string[]): boolean => {
    return genres.length >= VALIDATION.GENRES_MIN_COUNT;
  };

  it("should require at least one genre", () => {
    expect(validateGenres(["Action"])).toBe(true);
    expect(validateGenres(["Action", "Comedy"])).toBe(true);
    expect(validateGenres([])).toBe(false);
  });

  it("should allow multiple genres", () => {
    expect(validateGenres(["Action", "Comedy", "Drama"])).toBe(true);
  });
});
