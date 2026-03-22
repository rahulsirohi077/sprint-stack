import { getCurrent } from '@/features/auth/queries'
import { redirect } from 'next/navigation';
import React from 'react'
import WorkspaceIdSettingsClient from '@/app/(standalone)/workspaces/[workspaceId]/settings/client';

const WorkspaceIdSettingsPage = async () => {
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className='w-full lg:max-w-xl'>
            <WorkspaceIdSettingsClient />
        </div>
    )
}

export default WorkspaceIdSettingsPage