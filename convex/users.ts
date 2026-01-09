import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { ADMIN_EMAILS, ROLES } from "./constants";

/**
 * User Management Functions
 *
 * Handles user synchronization from Clerk webhooks and role management
 */

/**
 * Create or update user from Clerk webhook (Internal)
 * Called when user signs up or updates their profile
 */
export const syncUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    // Determine role based on email
    const role = ADMIN_EMAILS.includes(args.email) ? ROLES.ADMIN : ROLES.USER;

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        role, // Re-assign role in case admin list changed
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name,
        role,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

/**
 * Get user by Clerk user ID
 */
export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
  },
});

/**
 * Get current authenticated user
 * Returns null if not authenticated
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

/**
 * List all non-archived users (admin only)
 */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    // Verify admin role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Return all non-archived users
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

/**
 * Update user role (admin only)
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Verify admin role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update role
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Soft delete user (archive) (Internal)
 * Called from Clerk webhook when user is deleted
 */
export const archiveUser = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (!user) return;

    // Mark user as archived
    await ctx.db.patch(user._id, {
      isArchived: true,
      updatedAt: Date.now(),
    });

    // Also archive all their recommendations
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkUserId))
      .collect();

    for (const rec of recommendations) {
      await ctx.db.patch(rec._id, {
        isArchived: true,
        updatedAt: Date.now(),
      });
    }
  },
});
