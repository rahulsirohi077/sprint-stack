import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, WORKSPACE_ID } from '@/config';
import { MemberRole } from '@/features/members/type';
import { calculateDifference, generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import { MemberRow, WorkspaceRow } from '../types';
import { ProjectsRow } from '@/features/projects/type';
import { Task, TaskStatus } from '@/features/tasks/types';
import z from 'zod';

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get('user')
        const databases = c.get("tablesDB");

        const members = await databases.listRows<MemberRow>({
            databaseId: DATABASE_ID,
            tableId: MEMBERS_ID,
            queries: [Query.equal("userId", user.$id)]
        })

        if (members.total === 0) {
            return c.json({ data: { rows: [], total: 0 } });
        }

        const workspaceId = members.rows.map((member) => member.workspaceId);

        const workspaces = await databases.listRows<WorkspaceRow>({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            queries: [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceId)
            ]
        })

        return c.json({ data: workspaces }, 200);
    })
    .get("/:workspaceId", sessionMiddleware, async (c) => {
        const user = c.get('user')
        const databases = c.get("tablesDB");

        const { workspaceId } = c.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const workspace = await databases.getRow<WorkspaceRow>({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            rowId: workspaceId
        });

        if (!workspace) {
            return c.json({ error: "Not Found" }, 404);
        }

        return c.json({ data: workspace }, 200);
    })
    .get("/:workspaceId/info", sessionMiddleware, async (c) => {
        const databases = c.get("tablesDB");
        const { workspaceId } = c.req.param();

        const workspace = await databases.getRow<WorkspaceRow>({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            rowId: workspaceId
        });

        if (!workspace) {
            return c.json({ error: "Not Found" }, 404);
        }

        return c.json({
            data: {
                $id: workspace.$id,
                name: workspace.name,
                imageUrl: workspace.imageUrl
            }
        }, 200);
    })
    .post('/', zValidator('form', createWorkspaceSchema), sessionMiddleware, async (c) => {
        const tablesDB = c.get('tablesDB');
        const storage = c.get("storage");
        const user = c.get('user');

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

        const workspace = await tablesDB.createRow<WorkspaceRow>({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            rowId: ID.unique(),
            data: {
                name,
                userId: user.$id,
                imageUrl: uploadedImageUrl,
                inviteCode: generateInviteCode(6)
            },
        });

        await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: MEMBERS_ID,
            rowId: ID.unique(),
            data: {
                userId: user.$id,
                workspaceId: workspace.$id,
                role: MemberRole.ADMIN
            }
        });
        return c.json({ data: workspace }, 201);
    })
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => {
            const databases = c.get("tablesDB");
            const user = c.get("user")
            const storage = c.get("storage")

            const { workspaceId } = c.req.param();
            c.req.valid('form');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
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

            const workspace = await databases.updateRow({
                databaseId: DATABASE_ID,
                tableId: WORKSPACE_ID,
                rowId: workspaceId,
                data: {
                    name,
                    imageUrl: uploadedImageUrl
                }
            })

            return c.json({data: workspace})
        }
    )
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("tablesDB");
            const user = c.get("user");

            const {workspaceId} = c.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if(!member || member.role !== MemberRole.ADMIN){
                return c.json({error:"Unauthorized"},401);
            }

            while (true) {
                const tasks = await databases.listRows<Task>({
                    databaseId: DATABASE_ID,
                    tableId: TASKS_ID,
                    queries: [
                        Query.equal("workspaceId", workspaceId),
                        Query.limit(100)
                    ]
                });

                if (tasks.rows.length === 0) {
                    break;
                }

                await Promise.all(
                    tasks.rows.map((task) =>
                        databases.deleteRow({
                            databaseId: DATABASE_ID,
                            tableId: TASKS_ID,
                            rowId: task.$id,
                        })
                    )
                );
            }

            while (true) {
                const projects = await databases.listRows<ProjectsRow>({
                    databaseId: DATABASE_ID,
                    tableId: PROJECTS_ID,
                    queries: [
                        Query.equal("workspaceId", workspaceId),
                        Query.limit(100)
                    ]
                });

                if (projects.rows.length === 0) {
                    break;
                }

                await Promise.all(
                    projects.rows.map((project) =>
                        databases.deleteRow({
                            databaseId: DATABASE_ID,
                            tableId: PROJECTS_ID,
                            rowId: project.$id,
                        })
                    )
                );
            }

            while (true) {
                const members = await databases.listRows<MemberRow>({
                    databaseId: DATABASE_ID,
                    tableId: MEMBERS_ID,
                    queries: [
                        Query.equal("workspaceId", workspaceId),
                        Query.limit(100)
                    ]
                });

                if (members.rows.length === 0) {
                    break;
                }

                await Promise.all(
                    members.rows.map((workspaceMember) =>
                        databases.deleteRow({
                            databaseId: DATABASE_ID,
                            tableId: MEMBERS_ID,
                            rowId: workspaceMember.$id,
                        })
                    )
                );
            }

            await databases.deleteRow({
                databaseId: DATABASE_ID,
                tableId: WORKSPACE_ID,
                rowId: workspaceId,
            })
            
            return c.json({data: {$id: workspaceId}});
        }
    )
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("tablesDB");
            const user = c.get("user");

            const {workspaceId} = c.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if(!member || member.role !== MemberRole.ADMIN){
                return c.json({error:"Unauthorized"},401);
            }


            const worksapce = await databases.updateRow({
                databaseId: DATABASE_ID,
                tableId: WORKSPACE_ID,
                rowId: workspaceId,
                data:{
                    inviteCode: generateInviteCode(6)
                }
            })
            
            return c.json({data: worksapce});
        }
    )
    .post(
        '/:workspaceId/join',
        sessionMiddleware,
        zValidator("json",z.object({code: z.string()})),
        async (c) => {
            const {workspaceId} = c.req.param();
            const {code} = c.req.valid('json');

            const databases = c.get("tablesDB");
            const user = c.get("user")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if(member) {
                return c.json({error:"Already a member"},400);
            }

            const workspace = await databases.getRow<WorkspaceRow>({
                databaseId: DATABASE_ID,
                tableId: WORKSPACE_ID,
                rowId: workspaceId
            })

            if(!workspace){
                return c.json({error:"Invalid Workspace"},400);
            }

            if(workspace.inviteCode !== code){
                return c.json({error:"Invalid Invite Code"},400);
            }

            await databases.createRow<MemberRow>({
                databaseId:DATABASE_ID,
                tableId:MEMBERS_ID,
                rowId: ID.unique(),
                data:{
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER
                }
            })

            return c.json({data: workspace});
        }
    )
    .get(
            "/:workspaceId/analytics",
            sessionMiddleware,
            async (c) => {
                const databases = c.get("tablesDB");
                const user = c.get("user");
    
                const { workspaceId } = c.req.param();
    
                const workspace = await databases.getRow<WorkspaceRow>({
                    databaseId: DATABASE_ID,
                    tableId: WORKSPACE_ID,
                    rowId: workspaceId,
                });
    
                if (!workspace) {
                    return c.json({ error: "Not Found" }, 404);
                }
    
                const member = await getMember({
                    databases,
                    workspaceId,
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
    
                const [thisMonthTasks, lastMonthTasks, thisMonthProjects, lastMonthProjects] = await Promise.all([
                    databases.listRows<Task>({
                        databaseId: DATABASE_ID,
                        tableId: TASKS_ID,
                        queries: [
                            Query.equal("workspaceId", workspaceId),
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
                            Query.equal("workspaceId", workspaceId),
                            Query.between(
                                "$createdAt",
                                lastMonthStart.toISOString(),
                                lastMonthEnd.toISOString()
                            ),
                        ],
                    }),
                    databases.listRows<ProjectsRow>({
                        databaseId: DATABASE_ID,
                        tableId: PROJECTS_ID,
                        queries: [
                            Query.equal("workspaceId", workspaceId),
                            Query.between(
                                "$createdAt",
                                thisMonthStart.toISOString(),
                                thisMonthEnd.toISOString()
                            ),
                        ],
                    }),
                    databases.listRows<ProjectsRow>({
                        databaseId: DATABASE_ID,
                        tableId: PROJECTS_ID,
                        queries: [
                            Query.equal("workspaceId", workspaceId),
                            Query.between(
                                "$createdAt",
                                lastMonthStart.toISOString(),
                                lastMonthEnd.toISOString()
                            ),
                        ],
                    }),
                ]);
    
                const thisMonthProjectCount = thisMonthProjects.total;
                const lastMonthProjectCount = lastMonthProjects.total;
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
                        projectCount: thisMonthProjectCount,
                        projectDifference: calculateDifference(thisMonthProjectCount, lastMonthProjectCount),
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