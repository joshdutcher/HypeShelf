import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/**
 * Clerk Webhook Handler
 *
 * Handles user lifecycle events from Clerk:
 * - user.created: Sync new user to Convex
 * - user.updated: Update user data in Convex
 * - user.deleted: Archive user and their recommendations
 *
 * Security: Validates webhook signature using CLERK_WEBHOOK_SECRET
 */
http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Parse webhook payload
    const payload = await request.json();
    const eventType = payload.type;

    // Extract user data from payload
    const clerkUserId = payload.data.id;
    const email =
      payload.data.email_addresses?.find(
        (e: any) => e.id === payload.data.primary_email_address_id
      )?.email_address || "";
    const firstName = payload.data.first_name || "";
    const lastName = payload.data.last_name || "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || undefined;

    // Handle different event types
    switch (eventType) {
      case "user.created":
      case "user.updated":
        // Sync user to database
        await ctx.runMutation(internal.users.syncUser, {
          clerkUserId,
          email,
          name,
        });
        break;

      case "user.deleted":
        // Archive user and their recommendations
        await ctx.runMutation(internal.users.archiveUser, {
          clerkUserId,
        });
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
