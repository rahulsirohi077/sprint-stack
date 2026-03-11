import { getCurrent } from '@/features/auth/actions'
import { getWorkspace } from '@/features/workspaces/actions';
import { EditWorkspaceForm } from '@/features/workspaces/components/edit-workspace-form';
import { redirect } from 'next/navigation';
import React from 'react'

interface WorkspaceIdSettingsPageProps {
    params: Promise<{
        workspaceId: string
    }>
}

const WorkspaceIdSettingsPage = async ({
    params
}: WorkspaceIdSettingsPageProps) => {
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }

    const workspaceId = (await params).workspaceId;

    const raw = await getWorkspace({ workspaceId });
    if (!raw) redirect(`/workspaces/${workspaceId}`);
    
    const initialValues = {
        $id: raw.$id,
        name: raw.name,
        userId: raw.userId,
        imageUrl: raw.imageUrl,
        inviteCode: raw.inviteCode,
    };

    return (
        <div className='w-full lg:max-w-xl'>
            <EditWorkspaceForm initialValues={initialValues} />
        </div>
    )
}

export default WorkspaceIdSettingsPage