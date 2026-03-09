import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ID } from 'node-appwrite';
import { createWorkspaceSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, IMAGES_BUCKET_ID, WORKSPACE_ID } from '@/config';

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const databases = c.get("tablesDB");

        const workspaces = await databases.listRows({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID
        })

        return c.json({data: workspaces},200);
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

        const workspace = await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            rowId: ID.unique(),
            data: {
                name,
                userId: user.$id,
                imageUrl: uploadedImageUrl,     
            },
        });

        return c.json({ data: workspace }, 201);
    });

export default app;