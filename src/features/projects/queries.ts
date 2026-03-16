import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { ProjectsRow } from "./type";

interface GetProjectProps {
    projectId: string;
}

export const getProject = async ({ projectId }: GetProjectProps) => {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const project = await databases.getRow<ProjectsRow>({
        databaseId: DATABASE_ID,
        tableId: PROJECTS_ID,
        rowId: projectId
    })

    const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: project.workspaceId
    })

    if (!member) {
        throw new Error("Unauthorized");
    }

    return project;
};