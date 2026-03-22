import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACE_ID } from '@/config';
import { MemberRole } from '@/features/members/type';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import { MemberRow, WorkspaceRow } from '../types';
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

            // TODO: Delete Members, Projects and Tasks

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

export default app;