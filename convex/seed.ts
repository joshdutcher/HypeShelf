import { mutation } from "./_generated/server";
import { SYSTEM_USER_ID } from "./constants";

/**
 * Seed Database with Sample Recommendations
 *
 * Run this mutation once to populate the database with sample data
 * from the "HypeShelf Team" system user.
 *
 * Usage: In Convex dashboard, run: mutation("seed:seedDatabase")
 */
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have recommendations
    const existing = await ctx.db.query("recommendations").first();
    if (existing) {
      return { message: "Database already seeded", count: 0 };
    }

    const now = Date.now();

    const recommendations = [
      {
        title: "The Shawshank Redemption",
        genres: ["Drama"],
        blurb:
          "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        link: "https://www.imdb.com/title/tt0111161/",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
        isStaffPick: true,
        tmdbId: 278,
      },
      {
        title: "Inception",
        genres: ["Action", "Sci-Fi", "Thriller"],
        blurb:
          "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
        link: "https://www.imdb.com/title/tt1375666/",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
        isStaffPick: false,
        tmdbId: 27205,
      },
      {
        title: "Everything Everywhere All at Once",
        genres: ["Action", "Comedy", "Sci-Fi"],
        blurb:
          "A Chinese-American woman gets swept up in an insane adventure, where she alone can save the world by exploring other universes.",
        link: "https://www.imdb.com/title/tt6710474/",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
        isStaffPick: false,
        tmdbId: 545611,
      },
      {
        title: "Parasite",
        genres: ["Drama", "Thriller"],
        blurb:
          "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        link: "https://www.imdb.com/title/tt6751668/",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        isStaffPick: false,
        tmdbId: 496243,
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        genres: ["Animation", "Action", "Sci-Fi"],
        blurb:
          "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        link: "https://www.imdb.com/title/tt9362722/",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        isStaffPick: false,
        tmdbId: 569094,
      },
      {
        title: "The Grand Budapest Hotel",
        genres: ["Comedy", "Drama"],
        blurb:
          "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy during the hotel's glory days.",
        link: "https://www.imdb.com/title/tt2278388/",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        isStaffPick: false,
        tmdbId: 120467,
      },
    ];

    let count = 0;
    for (const rec of recommendations) {
      await ctx.db.insert("recommendations", {
        ...rec,
        userId: SYSTEM_USER_ID,
        isArchived: false,
        createdAt: now + count * 1000, // Stagger timestamps
        updatedAt: now + count * 1000,
      });
      count++;
    }

    return {
      message: "Database seeded successfully",
      count,
    };
  },
});

/**
 * Clear all recommendations (for testing)
 * Use with caution!
 */
export const clearAllRecommendations = mutation({
  args: {},
  handler: async (ctx) => {
    const recommendations = await ctx.db.query("recommendations").collect();

    for (const rec of recommendations) {
      await ctx.db.delete(rec._id);
    }

    return { message: "All recommendations cleared", count: recommendations.length };
  },
});
