import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES, VALIDATION } from "./constants";

/**
 * Recommendation Management Functions
 *
 * All mutations include server-side authorization checks.
 * NEVER trust client-side role checks - always verify in Convex.
 */

/**
 * List recommendations for public page
 * Returns 6 most recent non-archived recommendations
 */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_archived_staff_pick_created", (q) =>
        q.eq("isArchived", false)
      )
      .order("desc")
      .take(6);

    // Enrich with user information
    const enriched = await Promise.all(
      recommendations.map(async (rec) => {
        if (rec.userId === "system") {
          return {
            ...rec,
            user: {
              name: "HypeShelf Team",
              email: "team@hypeshelf.com",
            },
          };
        }

        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", rec.userId))
          .unique();

        return {
          ...rec,
          user: user
            ? { name: user.name || "Anonymous", email: user.email }
            : { name: "Deleted User", email: "" },
        };
      })
    );

    // Sort: Staff Pick first, then newest
    return enriched.sort((a, b) => {
      if (a.isStaffPick && !b.isStaffPick) return -1;
      if (!a.isStaffPick && b.isStaffPick) return 1;
      return b.createdAt - a.createdAt;
    });
  },
});

/**
 * List all recommendations for authenticated users
 * Includes filtering by genre(s) with AND/OR logic
 */
export const listAll = query({
  args: {
    genres: v.optional(v.array(v.string())),
    filterMode: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
  },
  handler: async (ctx, args) => {
    // Get all non-archived recommendations
    let recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_archived_staff_pick_created", (q) =>
        q.eq("isArchived", false)
      )
      .collect();

    // Apply genre filtering if provided
    if (args.genres && args.genres.length > 0) {
      const filterMode = args.filterMode || "OR";

      recommendations = recommendations.filter((rec) => {
        if (filterMode === "AND") {
          // Must have ALL selected genres
          return args.genres!.every((genre) => rec.genres.includes(genre));
        } else {
          // Must have ANY selected genre
          return args.genres!.some((genre) => rec.genres.includes(genre));
        }
      });
    }

    // Enrich with user information
    const enriched = await Promise.all(
      recommendations.map(async (rec) => {
        if (rec.userId === "system") {
          return {
            ...rec,
            user: {
              name: "HypeShelf Team",
              email: "team@hypeshelf.com",
            },
          };
        }

        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", rec.userId))
          .unique();

        return {
          ...rec,
          user: user
            ? { name: user.name || "Anonymous", email: user.email }
            : { name: "Deleted User", email: "" },
        };
      })
    );

    // Sort: Staff Pick first, then newest
    return enriched.sort((a, b) => {
      if (a.isStaffPick && !b.isStaffPick) return -1;
      if (!a.isStaffPick && b.isStaffPick) return 1;
      return b.createdAt - a.createdAt;
    });
  },
});

/**
 * Get a single recommendation by ID
 */
export const getById = query({
  args: { id: v.id("recommendations") },
  handler: async (ctx, args) => {
    const rec = await ctx.db.get(args.id);
    if (!rec || rec.isArchived) return null;

    // Enrich with user information
    if (rec.userId === "system") {
      return {
        ...rec,
        user: {
          name: "HypeShelf Team",
          email: "team@hypeshelf.com",
        },
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", rec.userId))
      .unique();

    return {
      ...rec,
      user: user
        ? { name: user.name || "Anonymous", email: user.email }
        : { name: "Deleted User", email: "" },
    };
  },
});

/**
 * Create a new recommendation
 */
export const create = mutation({
  args: {
    title: v.string(),
    genres: v.array(v.string()),
    link: v.optional(v.string()),
    blurb: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    tmdbId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validation
    if (args.title.length > VALIDATION.TITLE_MAX_LENGTH) {
      throw new Error(`Title must be ${VALIDATION.TITLE_MAX_LENGTH} characters or less`);
    }

    if (args.genres.length < VALIDATION.GENRES_MIN_COUNT) {
      throw new Error(`At least ${VALIDATION.GENRES_MIN_COUNT} genre is required`);
    }

    if (args.blurb && args.blurb.length > VALIDATION.BLURB_MAX_LENGTH) {
      throw new Error(`Blurb must be ${VALIDATION.BLURB_MAX_LENGTH} characters or less`);
    }

    if (args.link && args.link.length > VALIDATION.LINK_MAX_LENGTH) {
      throw new Error(`Link must be ${VALIDATION.LINK_MAX_LENGTH} characters or less`);
    }

    // Validate URL format if link provided
    if (args.link) {
      try {
        new URL(args.link);
      } catch {
        throw new Error("Link must be a valid URL");
      }
    }

    const now = Date.now();

    // Create recommendation
    const recommendationId = await ctx.db.insert("recommendations", {
      title: args.title,
      genres: args.genres,
      link: args.link,
      blurb: args.blurb,
      posterUrl: args.posterUrl,
      userId: identity.subject,
      isStaffPick: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      tmdbId: args.tmdbId,
    });

    return recommendationId;
  },
});

/**
 * Update an existing recommendation
 * Users can only edit their own recommendations, admins can edit any
 */
export const update = mutation({
  args: {
    id: v.id("recommendations"),
    title: v.string(),
    genres: v.array(v.string()),
    link: v.optional(v.string()),
    blurb: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
    tmdbId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Get recommendation
    const recommendation = await ctx.db.get(args.id);
    if (!recommendation) throw new Error("Recommendation not found");
    if (recommendation.isArchived) throw new Error("Cannot edit archived recommendation");

    // Authorization check: must be owner or admin
    const isOwner = recommendation.userId === identity.subject;
    const isAdmin = currentUser.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized: You can only edit your own recommendations");
    }

    // Validation (same as create)
    if (args.title.length > VALIDATION.TITLE_MAX_LENGTH) {
      throw new Error(`Title must be ${VALIDATION.TITLE_MAX_LENGTH} characters or less`);
    }

    if (args.genres.length < VALIDATION.GENRES_MIN_COUNT) {
      throw new Error(`At least ${VALIDATION.GENRES_MIN_COUNT} genre is required`);
    }

    if (args.blurb && args.blurb.length > VALIDATION.BLURB_MAX_LENGTH) {
      throw new Error(`Blurb must be ${VALIDATION.BLURB_MAX_LENGTH} characters or less`);
    }

    if (args.link && args.link.length > VALIDATION.LINK_MAX_LENGTH) {
      throw new Error(`Link must be ${VALIDATION.LINK_MAX_LENGTH} characters or less`);
    }

    if (args.link) {
      try {
        new URL(args.link);
      } catch {
        throw new Error("Link must be a valid URL");
      }
    }

    // Update recommendation
    await ctx.db.patch(args.id, {
      title: args.title,
      genres: args.genres,
      link: args.link,
      blurb: args.blurb,
      posterUrl: args.posterUrl,
      tmdbId: args.tmdbId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a recommendation (soft delete)
 * Users can only delete their own, admins can delete any
 */
export const remove = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Get recommendation
    const recommendation = await ctx.db.get(args.id);
    if (!recommendation) throw new Error("Recommendation not found");

    // Authorization check: must be owner or admin
    const isOwner = recommendation.userId === identity.subject;
    const isAdmin = currentUser.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized: You can only delete your own recommendations");
    }

    // Soft delete (archive)
    await ctx.db.patch(args.id, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mark a recommendation as Staff Pick (admin only)
 * Only ONE Staff Pick can exist at a time
 */
export const markStaffPick = mutation({
  args: {
    id: v.id("recommendations"),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Authorization check: admin only
    if (currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get recommendation
    const recommendation = await ctx.db.get(args.id);
    if (!recommendation) throw new Error("Recommendation not found");
    if (recommendation.isArchived) throw new Error("Cannot mark archived recommendation as Staff Pick");

    // Find current Staff Pick (if any)
    const currentStaffPick = await ctx.db
      .query("recommendations")
      .withIndex("by_staff_pick", (q) => q.eq("isStaffPick", true))
      .unique();

    const now = Date.now();

    // Unmark current Staff Pick
    if (currentStaffPick && currentStaffPick._id !== args.id) {
      await ctx.db.patch(currentStaffPick._id, {
        isStaffPick: false,
        updatedAt: now,
      });
    }

    // Mark new Staff Pick
    await ctx.db.patch(args.id, {
      isStaffPick: true,
      updatedAt: now,
    });

    // Return previous Staff Pick info for confirmation UI
    return {
      previousStaffPick: currentStaffPick
        ? { id: currentStaffPick._id, title: currentStaffPick.title }
        : null,
    };
  },
});

/**
 * Unmark Staff Pick (admin only)
 */
export const unmarkStaffPick = mutation({
  args: {
    id: v.id("recommendations"),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Authorization check: admin only
    if (currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Unmark Staff Pick
    await ctx.db.patch(args.id, {
      isStaffPick: false,
      updatedAt: Date.now(),
    });
  },
});
