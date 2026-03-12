import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query, TablesDB } from "node-appwrite"
import { MemberRow } from "../workspaces/types";

interface GetMemberProps {
    databases: TablesDB;
    workspaceId: string;
    userId: string;
}

export const getMember = async ({
    databases,
    workspaceId,
    userId
}:GetMemberProps) => {
    const members = await databases.listRows<MemberRow>({
        databaseId: DATABASE_ID,
        tableId: MEMBERS_ID,
        queries:
        [
            Query.equal("workspaceId", workspaceId),
            Query.equal('userId', userId)
        ]
    })

    return members.rows[0];
}