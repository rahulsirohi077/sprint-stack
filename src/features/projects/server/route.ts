import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import z from "zod";
import { ProjectsRow } from "../type";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { MemberRole } from "@/features/members/type";

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
export default app;