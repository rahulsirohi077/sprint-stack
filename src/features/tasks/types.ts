import { Models } from "node-appwrite";

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS= "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
}

export type Task = Models.Row & {
    workspaceId: string;
    name: string;
    projectId: string;
    assigneeId: string;
    description?: string;
    dueDate: Date;
    status: TaskStatus;
    position: number;
}