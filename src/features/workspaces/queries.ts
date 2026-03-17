"use server";

import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { getMember } from "../members/utils";
import { WorkspaceList, WorkspaceRow } from "./types";

export const getWorkspaces = async (): Promise<WorkspaceList | null> => {
    const {account, databases} = await createSessionClient();

    const user = await account.get();

   const members = await databases.listRows({
        databaseId: DATABASE_ID,
        tableId: MEMBERS_ID,
        queries: [Query.equal("userId", user.$id)]
    })

    if (members.total === 0) {
        return { rows: [], total: 0 } as WorkspaceList;
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
};

interface GetWorkspaceProps {
    workspaceId: string;
}

export const getWorkspace = async ({workspaceId}:GetWorkspaceProps): Promise<WorkspaceRow | null> => {
    const {account, databases} = await createSessionClient();
    const user = await account.get();

    const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId
    })

    if(!member){
        throw new Error("Workspace not found or access denied");
    }

    const workspaces = await databases.getRow<WorkspaceRow>({
        databaseId: DATABASE_ID,
        tableId: WORKSPACE_ID,
        rowId: workspaceId
    })

    return workspaces;
};

interface GetWorkspaceInfoProps {
    workspaceId: string;
}

export const getWorkspaceInfo = async ({workspaceId}:GetWorkspaceInfoProps) => {
    const {databases} = await createSessionClient();

    const workspaces = await databases.getRow<WorkspaceRow>({
        databaseId: DATABASE_ID,
        tableId: WORKSPACE_ID,
        rowId: workspaceId
    })

    if (!workspaces) {
        throw new Error("Workspace info not found");
    }

    return {
        name: workspaces.name
    };
};