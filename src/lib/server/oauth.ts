// src/lib/server/oauth.js
"use server";

import { createAdminClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";

async function createOAuthRedirect(provider: OAuthProvider) {
  const { account } = await createAdminClient();

  const h = await headers();
  const origin = h.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    throw new Error("Missing origin. Set NEXT_PUBLIC_APP_URL.");
  }

  const redirectUrl = await account.createOAuth2Token({
    provider,
    success: `${origin}/oauth`,
    failure: `${origin}/sign-up`,
  });

  return redirect(redirectUrl);
}

export async function signUpWithGithub() {
  return createOAuthRedirect(OAuthProvider.Github);
}

export async function signUpWithGoogle() {
  return createOAuthRedirect(OAuthProvider.Google);
}


