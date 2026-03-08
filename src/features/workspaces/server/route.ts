import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ID } from 'node-appwrite';
import { createWorkspaceSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, WORKSPACE_ID } from '@/config';

const app = new Hono()
    .post('/', zValidator('json', createWorkspaceSchema), sessionMiddleware, async (c) => {
        const tablesDB = c.get('tablesDB');
        const user = c.get('user');
        const { name } = c.req.valid('json');

        const row = await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: WORKSPACE_ID,
            rowId: ID.unique(),
            data: { name, userId: user.$id },
        });

        return c.json({ data: row }, 201);
    });

export default app;