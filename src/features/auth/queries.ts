"use server";

import { cookies } from "next/headers";
import { Account, Client, Models } from "node-appwrite";
import { AUTH_COOKIE } from "./constants";
import { createSessionClient } from "@/lib/appwrite";

type CurrentUser = Models.User<Models.Preferences>;

export const getCurrent = async (): Promise<CurrentUser | null> => {
    try {
        const {account} = await createSessionClient();

        return await account.get();
    } catch {
        return null
    }
}