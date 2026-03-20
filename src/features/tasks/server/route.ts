import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schema";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { Task, TaskStatus } from "../types";
import z from "zod";
import { createAdminClient } from "@/lib/appwrite";
import { ProjectsRow } from "@/features/projects/type";
import { MemberRow } from "@/features/workspaces/types";

const app = new Hono()
    .delete(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user")
            const databases = c.get("tablesDB")
            const { taskId } = c.req.param();
            
            const task = await databases.getRow<Task>({
                databaseId: DATABASE_ID,
                tableId: TASKS_ID,
                rowId: taskId
            })

            if(!task){
                return c.json({error: "Not Found"},404)
            }

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            })

            if(!member) {
                return c.json({error: "Unauthorized"},401)
            }

            await databases.deleteRow({
                databaseId: DATABASE_ID,
                tableId: TASKS_ID,
                rowId: taskId
            })

            return c.json({data: { $id: task.$id }})
        }
    )
    .get(
        '/',
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
                projectId: z.string().nullish(),
                assigneeId: z.string().nullish(),
                status: z.enum(TaskStatus).nullish(),
                search: z.string().nullish(),
                dueDate: z.string().nullish(),
            })
        ),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("tablesDB");
            const user = c.get("user");

            const {
                workspaceId,
                projectId,
                assigneeId,
                search,
                status,
                dueDate
            } = c.req.valid('query');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if(!member){
                return c.json({error: "Unauthorized"},401);
            }

            const query = [
                Query.equal("workspaceId",workspaceId),
                Query.orderDesc("$createdAt")
            ]

            if(projectId) {
                console.log("projectId", projectId);
                query.push(Query.equal("projectId",projectId))
            }

            if(status) {
                console.log("status", status);
                query.push(Query.equal("status",status))
            }

            if(assigneeId) {
                console.log("assigneeId", assigneeId);
                query.push(Query.equal("assigneeId",assigneeId))
            }

            if(search) {
                console.log("search", search);
                query.push(Query.search("name",search))
            }

            if(dueDate) {
                console.log("dueDate", dueDate);
                query.push(Query.equal("dueDate",dueDate))
            }

            const tasks = await databases.listRows<Task>({
                databaseId: DATABASE_ID,
                tableId: TASKS_ID,
                queries: query
            });

            const projectIds = tasks.rows.map((task)=> task.projectId);
            const assigneeIds = tasks.rows.map((task)=> task.assigneeId);

            const projects = await databases.listRows<ProjectsRow>(
                {
                    databaseId: DATABASE_ID,
                    tableId: PROJECTS_ID,
                    queries: projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
                }
            )

            const members = await databases.listRows<MemberRow>(
                {
                    databaseId: DATABASE_ID,
                    tableId: MEMBERS_ID,
                    queries: assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
                }
            );

            const assignees = await Promise.all(
                members.rows.map( async (member) => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    }
                })
            )

            const populatedTasks = tasks.rows.map((task)=> {
                const project = projects.rows.find(
                    (project) => project.$id === task.projectId
                )

                const assignee = assignees.find(
                    (assignee) => assignee.$id === task.assigneeId
                )

                return {
                ...task,
                project,
                assignee
            }
            })

            return c.json({
                data: {
                    ...tasks,
                    rows: populatedTasks
                }
            })
        }
    )
    .post(
        "/",
        sessionMiddleware,
        zValidator('json', createTaskSchema),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("tablesDB");

            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
                description
            } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if(!member) {
                return c.json({error: "Unauthorized"},401);
            }

            const highestPositionTask = await databases.listRows<Task>({
                databaseId: DATABASE_ID,
                tableId: TASKS_ID,
                queries:[
                    Query.equal("status",status),
                    Query.equal("workspaceId",workspaceId),
                    Query.orderDesc("position"),
                    Query.limit(1)
                ]
            })

            const newPosition = highestPositionTask.rows.length > 0 
                ? highestPositionTask.rows[0].position + 1000
                : 1000;

            const task = await databases.createRow<Omit<Task, "dueDate"> & { dueDate: Date }>({
                databaseId:DATABASE_ID,
                tableId:TASKS_ID,
                rowId: ID.unique(),
                data: {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    description,
                    dueDate,
                    assigneeId,
                    position: newPosition
                }
            });

            return c.json({data: task});
        }
    )
    .patch(
        "/:taskId",
        sessionMiddleware,
        zValidator('json', createTaskSchema.partial()),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("tablesDB");
            const { taskId } = c.req.param();

            const {
                name,
                status,
                projectId,
                dueDate,
                assigneeId,
                description
            } = c.req.valid("json");

            const existingTask = await databases.getRow<Task>({
                databaseId: DATABASE_ID,
                tableId: TASKS_ID,
                rowId: taskId
            });

            if (!existingTask) {
                return c.json({ error: "Not Found" }, 404);
            }

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const task = await databases.updateRow<Omit<Task, "dueDate"> & { dueDate?: Date }>({
                databaseId: DATABASE_ID,
                tableId: TASKS_ID,
                rowId: taskId,
                data: {
                    ...(name !== undefined && { name }),
                    ...(status !== undefined && { status }),
                    ...(projectId !== undefined && { projectId }),
                    ...(dueDate !== undefined && { dueDate }),
                    ...(assigneeId !== undefined && { assigneeId }),
                    ...(description !== undefined && { description }),
                }
            });

            return c.json({ data: task });
        }
    )
    .get(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("tablesDB");
            const user = c.get("user");
            const { taskId } = c.req.param();

            const task = await databases.getRow<Task>({
                databaseId: DATABASE_ID,
                tableId: TASKS_ID,
                rowId: taskId
            });

            if (!task) {
                return c.json({ error: "Not Found" }, 404);
            }

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const project = await databases.getRow<ProjectsRow>({
                databaseId: DATABASE_ID,
                tableId: PROJECTS_ID,
                rowId: task.projectId
            });

            const taskMember = await databases.getRow<MemberRow>({
                databaseId: DATABASE_ID,
                tableId: MEMBERS_ID,
                rowId: task.assigneeId
            });

            const assigneeUser = await users.get({userId:taskMember.userId});

            const assignee = {
                ...taskMember,
                name: assigneeUser.name,
                email: assigneeUser.email
            };

            return c.json({
                data: {
                    ...task,
                    project,
                    assignee
                }
            });
        }
    )


export default app;