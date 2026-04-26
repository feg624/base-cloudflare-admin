import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { Resend } from "resend";

let emailPromise: Promise<any> | null = null;

export const getEmailPromise = () => emailPromise;

export const sendVerificationEmailInternal = async (env: any, { user, url }: { user: { email: string }, url: string }) => {
  if (!env.RESEND_API_KEY) {
    console.error("ERROR: RESEND_API_KEY no definida");
    return { error: "Missing API Key" };
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const from = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    return await resend.emails.send({
      from,
      to: user.email,
      subject: "Verify your email address",
      html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
    });
  } catch (err) {
    console.error("Error en Resend:", err);
    return { error: err };
  }
};

export const getAuth = (env: any, ctx?: any) => {
  const db = getDb(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    debug: false,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async (data, request) => {
        emailPromise = sendVerificationEmailInternal(env, data);
        if (ctx?.waitUntil) {
          ctx.waitUntil(emailPromise);
        }
        return emailPromise;
      },
    },
    advanced: {
      backgroundTasks: {
        handler: (promise) => {
          if (ctx?.waitUntil) {
            ctx.waitUntil(promise);
          }
          return promise;
        },
      },
    },
    plugins: [
      username(),
      admin(),
      tanstackStartCookies(),
    ],
  });
};

/*
// required to run better-auth cli
// bun x auth@latest generate --config ./src/lib/auth.ts --output ./src/db/schema.ts --adapter drizzle --dialect sqlite

export const auth = betterAuth({
  database: drizzleAdapter({}, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    admin(),
  ]
})
*/
