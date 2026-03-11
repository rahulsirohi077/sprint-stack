import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { createWorkspaceSchema, MemberRow, WorkspaceRow } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACE_ID } from '@/config';
import { MemberRole } from '@/features/members/type';
import { generateInviteCode } from '@/lib/utils';

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

        const workspaceId = members.rows.map((member)=> member.workspaceId);

        const workspaces = await databases.listRows<WorkspaceRow>({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            queries:[
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceId)
            ]
        })

        return c.json({ data: workspaces }, 200);
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
        return c.json({ data: workspace}, 201);
    });

export default app;