"use server";

import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { cookies } from "next/headers";
import { Account, Client, Query, TablesDB } from "node-appwrite";
import { WorkspaceList, WorkspaceRow } from "./types";
import { getMember } from "../members/utils";

export const getWorkspaces = async (): Promise<WorkspaceList | null> => {
    try {
        const client =  new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        
        const session = (await cookies()).get(AUTH_COOKIE);
        
        if(!session) return  { rows: [], total: 0 } as WorkspaceList;
        
        client.setSession(session.value);
        const databases = new TablesDB(client);
        const account = new Account(client);
        const user = await account.get();

       const members = await databases.listRows({
            databaseId: DATABASE_ID,
            tableId: MEMBERS_ID,
            queries: [Query.equal("userId", user.$id)]
        })

        if (members.total === 0) {
            return  { rows: [], total: 0 } as WorkspaceList;
        }

        const workspaceId = members.rows.map((member)=> member.workspaceId);

        const workspaces = await databases.listRows<WorkspaceRow>({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            queries:[
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceId)
            ]
        })

        return workspaces;
    } catch (error) {
        return { rows: [], total: 0 } as WorkspaceList;
    }
};

interface getWorkspaceProps {
    workspaceId: string;
}

export const getWorkspace = async ({workspaceId}:getWorkspaceProps): Promise<WorkspaceRow | null> => {
    try {
        const client =  new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        
        const session = (await cookies()).get(AUTH_COOKIE);
        
        if(!session) return null;

        client.setSession(session.value);
        const databases = new TablesDB(client);
        const account = new Account(client);
        const user = await account.get();

        const member = await getMember({
            databases,
            userId: user.$id,
            workspaceId
        })

        if(!member){
            return null;
        }

        const workspaces = await databases.getRow<WorkspaceRow>({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            rowId: workspaceId
        })

        return workspaces;
    } catch (error) {
        return null;
    }
};