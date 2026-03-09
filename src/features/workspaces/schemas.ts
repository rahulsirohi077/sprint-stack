import { Models } from "node-appwrite";
import z from "zod";
import { MemberRole } from "../members/type";


export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => (value === "" ? undefined : value)),
  ])
  .optional(),
});

export type WorkspaceRow = Models.DefaultRow & {
    name: string;
    userId: string;
    imageUrl?: string;
    inviteCode: string;
};

export type WorkspaceList = Models.RowList<WorkspaceRow>;

export type MemberRow = Models.DefaultRow & {
  userId: string;
  workspaceId: string;
  role: MemberRole;
}

export type MembersList = Models.RowList<MemberRow>