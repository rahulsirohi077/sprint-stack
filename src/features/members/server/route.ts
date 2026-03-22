import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getMember } from "../utils";
import { MemberRow } from "@/features/workspaces/types";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { AwardIcon } from "lucide-react";
import { MemberRole } from "../type";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("tablesDB");
            const user = c.get("user");
            const { workspaceId } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const members = await databases.listRows<MemberRow>({
                databaseId: DATABASE_ID,
                tableId: MEMBERS_ID,
                queries: [Query.equal("workspaceId", workspaceId)],
            });

            const populateMembers = await Promise.all(
                members.rows.map(async (member) => {
                    const user = await users.get({ userId: member.userId });

                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    };
                }),
            );

            return c.json({
                data: {
                    ...members,
                    rows: populateMembers,
                },
            });
        },
    )
    .delete("/:memberId", sessionMiddleware, async (c) => {
        const { memberId } = c.req.param();
        const user = c.get("user");
        const databases = c.get("tablesDB");

        const memberToDelete = await databases.getRow<MemberRow>({
            databaseId: DATABASE_ID,
            tableId: MEMBERS_ID,
            rowId: memberId,
        });

        const allMembersInWorkspace = await databases.listRows<MemberRow>({
            databaseId: DATABASE_ID,
            tableId: MEMBERS_ID,
            queries: [Query.equal("workspaceId", memberToDelete.workspaceId)],
        });

        const member = await getMember({
            databases,
            workspaceId: memberToDelete.workspaceId,
            userId: user.$id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
            return c.json({ error: "Forbidden" }, 403);
        }

        if (allMembersInWorkspace.total === 1) {
            return c.json({ error: "Cannot Delete the only member" }, 409);
        }

        await databases.deleteRow({
            databaseId: DATABASE_ID,
            tableId: MEMBERS_ID,
            rowId: memberId
        });

        return c.json({ data: { $id: memberToDelete.$id } });
    })
    .patch(
        "/:memberId",
        sessionMiddleware,
        zValidator("json", z.object({ role: z.enum(MemberRole) })),
        async (c) => {
            const { memberId } = c.req.param();
            const user = c.get("user");
            const { role } = c.req.valid("json");
            const databases = c.get("tablesDB");

            const memberToUpdate = await databases.getRow<MemberRow>({
                databaseId: DATABASE_ID,
                tableId: MEMBERS_ID,
                rowId: memberId,
            });

            const allMembersInWorkspace = await databases.listRows<MemberRow>({
                databaseId: DATABASE_ID,
                tableId: MEMBERS_ID,
                queries: [Query.equal("workspaceId", memberToUpdate.workspaceId)],
            });

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if (member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Forbidden" }, 403);
            }

            if (allMembersInWorkspace.total === 1) {
                return c.json({ error: "Cannot Downgrade the only member" }, 409);
            }

            await databases.updateRow<MemberRow>({
                databaseId: DATABASE_ID,
                tableId: MEMBERS_ID,
                rowId: memberId,
                data:{
                    role: role
                }
            });

            return c.json({ data: { $id: memberToUpdate.$id } });
        }
    )

export default app;
