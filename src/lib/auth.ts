import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/index";

if (!process.env.BETTER_AUTH_URL) {
  throw new Error(
    "BETTER_AUTH_URL environment variable is required. Set it in your .env.local file."
  );
}

const baseURL = process.env.BETTER_AUTH_URL;

// Validate Google OAuth credentials are set
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required. Set them in your .env file."
  );
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL,
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      redirectURI: `${baseURL}/api/auth/callback/discord`,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: `${baseURL}/api/auth/callback/google`,
    },
  },
});

