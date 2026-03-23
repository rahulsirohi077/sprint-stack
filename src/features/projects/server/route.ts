import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import z from "zod";
import { ProjectsRow } from "../type";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Task, TaskStatus } from "@/features/tasks/types";
import { calculateDifference } from "@/lib/utils";

const app = new Hono()
    .post(
        "/",
        sessionMiddleware,
        zValidator('form', createProjectSchema),
        async (c) => {
            const databases = c.get('tablesDB');
            const storage = c.get("storage");
            const user = c.get('user');

            const { name, image, workspaceId } = c.req.valid('form');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile({
                    bucketId: IMAGES_BUCKET_ID,
                    fileId: ID.unique(),
                    file: image
                })

                const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
                const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
                uploadedImageUrl = `${endpoint}/storage/buckets/${IMAGES_BUCKET_ID}/files/${file.$id}/view?project=${project}`;
            }

            const project = await databases.createRow<ProjectsRow>({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: ID.unique(),
                data: {
                    name,
                    imageUrl: uploadedImageUrl,
                    workspaceId
                },
            });

            return c.json({ data: project }, 201);
        }
    )
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get('user')
            const databases = c.get("tablesDB")

            const { workspaceId } = c.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const projects = await databases.listRows<ProjectsRow>({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                queries: [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            })

            return c.json({ data: projects });
        }
    )
    .get(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("tablesDB");
            const user = c.get("user");

            const { projectId } = c.req.param();

            const project = await databases.getRow<ProjectsRow>({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: projectId
            });

            if (!project) {
                return c.json({ error: "Not Found" }, 404);
            }

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            return c.json({ data: project });
        }
    )
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const databases = c.get("tablesDB");
            const user = c.get("user")
            const storage = c.get("storage")

            const { projectId } = c.req.param();
            c.req.valid('form');

            const existingProject = await databases.getRow<ProjectsRow>({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: projectId
            })

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const { name, image } = c.req.valid('form');

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile({
                    bucketId: IMAGES_BUCKET_ID,
                    fileId: ID.unique(),
                    file: image
                })

                const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
                const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
                uploadedImageUrl = `${endpoint}/storage/buckets/${IMAGES_BUCKET_ID}/files/${file.$id}/view?project=${project}`;
            }
            else {
                uploadedImageUrl = image;
            }

            const project = await databases.updateRow({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: projectId,
                data: {
                    name,
                    imageUrl: uploadedImageUrl
                }
            })

            return c.json({ data: project })
        }
    )
    .delete(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("tablesDB");
            const user = c.get("user");

            const { projectId } = c.req.param();

            const existingProject = await databases.getRow<ProjectsRow>({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: projectId
            })

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // TODO: Delete Tasks

            await databases.deleteRow({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: projectId,
            })

            return c.json({ data: { $id: existingProject.$id } });
        }
    )
    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("tablesDB");
            const user = c.get("user");

            const { projectId } = c.req.param();

            const project = await databases.getRow<ProjectsRow>({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: projectId,
            });

            if (!project) {
                return c.json({ error: "Not Found" }, 404);
            }

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthDate = subMonths(now, 1);
            const lastMonthStart = startOfMonth(lastMonthDate);
            const lastMonthEnd = endOfMonth(lastMonthDate);

            const [thisMonthTasks, lastMonthTasks] = await Promise.all([
                databases.listRows<Task>({
                    databaseId: DATABASE_ID,
                    tableId: TASKS_ID,
                    queries: [
                        Query.equal("projectId", projectId),
                        Query.between(
                            "$createdAt",
                            thisMonthStart.toISOString(),
                            thisMonthEnd.toISOString()
                        ),
                    ],
                }),
                databases.listRows<Task>({
                    databaseId: DATABASE_ID,
                    tableId: TASKS_ID,
                    queries: [
                        Query.equal("projectId", projectId),
                        Query.between(
                            "$createdAt",
                            lastMonthStart.toISOString(),
                            lastMonthEnd.toISOString()
                        ),
                    ],
                }),
            ]);

            const thisMonthTaskCount = thisMonthTasks.total;
            const lastMonthTaskCount = lastMonthTasks.total;

            const thisMonthIncompleteTaskCount = thisMonthTasks.rows.filter(
                (task) => task.status !== TaskStatus.DONE
            ).length;
            const lastMonthIncompleteTaskCount = lastMonthTasks.rows.filter(
                (task) => task.status !== TaskStatus.DONE
            ).length;

            const thisMonthCompletedTaskCount = thisMonthTasks.rows.filter(
                (task) => task.status === TaskStatus.DONE
            ).length;
            const lastMonthCompletedTaskCount = lastMonthTasks.rows.filter(
                (task) => task.status === TaskStatus.DONE
            ).length;

            const thisMonthAssignedTaskCount = thisMonthTasks.rows.filter(
                (task) => task.assigneeId === member.$id
            ).length;
            const lastMonthAssignedTaskCount = lastMonthTasks.rows.filter(
                (task) => task.assigneeId === member.$id
            ).length;

            const thisMonthOverdueTaskCount = thisMonthTasks.rows.filter(
                (task) => task.status !== TaskStatus.DONE && new Date(task.dueDate) < now
            ).length;
            const lastMonthOverdueTaskCount = lastMonthTasks.rows.filter(
                (task) => task.status !== TaskStatus.DONE && new Date(task.dueDate) < now
            ).length;

            return c.json({
                data: {
                    taskCount: thisMonthTaskCount,
                    taskDifference: calculateDifference(thisMonthTaskCount, lastMonthTaskCount),
                    incompleteTaskCount: thisMonthIncompleteTaskCount,
                    incompleteTaskDifference: calculateDifference(
                        thisMonthIncompleteTaskCount,
                        lastMonthIncompleteTaskCount
                    ),
                    completedTaskCount: thisMonthCompletedTaskCount,
                    completedTaskDifference: calculateDifference(
                        thisMonthCompletedTaskCount,
                        lastMonthCompletedTaskCount
                    ),
                    assignedTaskCount: thisMonthAssignedTaskCount,
                    assignedTaskDifference: calculateDifference(
                        thisMonthAssignedTaskCount,
                        lastMonthAssignedTaskCount
                    ),
                    overdueTaskCount: thisMonthOverdueTaskCount,
                    overdueTaskDifference: calculateDifference(
                        thisMonthOverdueTaskCount,
                        lastMonthOverdueTaskCount
                    ),
                },
            });
        }
    )

    
export default app;