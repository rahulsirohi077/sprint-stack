import { Models } from "node-appwrite";

export type ProjectsRow = Models.Row & {
    workspaceId: string;
    name: string;
    imageUrl?: string;
}