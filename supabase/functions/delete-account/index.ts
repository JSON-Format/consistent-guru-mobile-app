import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    try {
      // Get authenticated user's ID from verified JWT
      const userId = ctx.userClaims?.id;

      if (!userId) {
        return Response.json(
          {
            error: "Unable to identify the authenticated user.",
          },
          { status: 401 }
        );
      }

      console.log("Authenticated user ID:", userId);

      // Delete Supabase Auth account
      const { error } =
        await ctx.supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        console.error("Delete user error:", error);

        return Response.json(
          {
            error: "Unable to delete account.",
            details: error.message,
          },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: "Account deleted successfully.",
      });
    } catch (error) {
      console.error("Unexpected delete account error:", error);

      return Response.json(
        {
          error: "An unexpected error occurred.",
        },
        { status: 500 }
      );
    }
  }),
};