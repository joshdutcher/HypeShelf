import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database schema for HypeShelf
 *
 * Security Note: All mutations must verify user roles and ownership
 * before allowing data modifications. Never trust client-side checks.
 */
export default defineSchema({
  users: defineTable({
    // Clerk user ID (unique identifier from authentication provider)
    clerkUserId: v.string(),

    // User email from Clerk
    email: v.string(),

    // User display name (optional)
    name: v.optional(v.string()),

    // Role-based access control
    // "admin": Can delete any recommendation, mark Staff Picks, manage user roles
    // "user": Can only create/edit/delete own recommendations
    role: v.union(v.literal("user"), v.literal("admin")),

    // Soft delete flag (preserves data when user account is deleted)
    isArchived: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  recommendations: defineTable({
    // Movie title (max 100 characters, validated in mutation)
    title: v.string(),

    // Genre tags from predefined enum (can select multiple)
    // Initial genres: Action, Comedy, Drama, Horror, Sci-Fi, Romance, Thriller,
    // Documentary, Animation, Fantasy, Mystery, Other
    // Dynamically expands when TMDb returns new genres
    genres: v.array(v.string()),

    // Optional URL link (typically IMDB from TMDb, max 2000 characters)
    link: v.optional(v.string()),

    // Optional short description (max 500 characters)
    blurb: v.optional(v.string()),

    // Movie poster image URL from TMDb (or placeholder)
    posterUrl: v.optional(v.string()),

    // User who created this recommendation
    // Special value "system" for seed data created by HypeShelf Team
    userId: v.string(),

    // Staff Pick flag (only one can be true at a time)
    // When marking a new Staff Pick, previous one is automatically unmarked
    isStaffPick: v.boolean(),

    // Soft delete flag (preserves data when user or recommendation is deleted)
    isArchived: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),

    // TMDb movie ID (if selected from autocomplete)
    tmdbId: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"])
    .index("by_staff_pick", ["isStaffPick"])
    // Composite index for efficient queries: non-archived, sorted by Staff Pick and creation date
    .index("by_archived_staff_pick_created", ["isArchived", "isStaffPick", "createdAt"]),
});
