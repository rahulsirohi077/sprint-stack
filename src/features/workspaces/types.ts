import { Models } from "node-appwrite";
import { MemberRole } from "../members/type";

export type WorkspaceRow = Models.Row & {
    name: string;
    userId: string;
    imageUrl?: string;
    inviteCode: string;
};

export type WorkspaceList = Models.RowList<WorkspaceRow>;

export type MemberRow = Models.Row & {
  userId: string;
  workspaceId: string;
  role: MemberRole;
}

export type MembersList = Models.RowList<MemberRow>