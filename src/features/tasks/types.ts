import { Models } from "node-appwrite";
import { ProjectsRow } from "../projects/type";
import { MemberRow } from "../workspaces/types";

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
}

export type Task = Models.Row & {
    workspaceId: string;
    name: string;
    projectId: string;
    assigneeId: string;
    description?: string;
    dueDate: string;
    status: TaskStatus;
    position: number;
    project?: {
        $id: string;
        name: string;
        imageUrl?: string;
    };
    assignee?: {
        $id: string;
        name: string;
    };
}

export type TaskTableRow = {
    $id: string;
    name: string;
    status: TaskStatus;
    projectId: string;
    position: number;
    dueDate: string;
    project?: {
        $id: string;
        name: string;
        imageUrl?: string;
    };
    assignee?: {
        $id: string;
        name: string;
    };
};