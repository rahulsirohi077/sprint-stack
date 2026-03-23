// src/app/oauth/route.js

import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// import { Account, Client } from "node-appwrite";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if(!userId || !secret){
    return new NextResponse("Missing Fields", {status:400})
  }

  const { account } = await createAdminClient();
  const session = await account.createSession({
    userId,
    secret
  });

  (await cookies()).set(AUTH_COOKIE, session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

//   const userClient = new Client()
//     .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
//     .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
//     .setSession(session.secret);

//   const userAccount = new Account(userClient);
//   const user = await userAccount.get();

//   if (!user.name?.trim()) {
//     const fallbackName = user.email?.split("@")[0] ?? "User";
//     await userAccount.updateName({ name: fallbackName });
//   }

  return NextResponse.redirect(`${request.nextUrl.origin}/`);
}
