"use server";

import { createSessionClient } from "@/lib/appwrite";
import { Models } from "node-appwrite";

type CurrentUser = Models.User<Models.Preferences>;

export const getCurrent = async (): Promise<CurrentUser | null> => {
    try {
        const {account} = await createSessionClient();

        return await account.get();
    } catch {
        return null
    }
}