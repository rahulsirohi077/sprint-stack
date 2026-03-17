import { getCurrent } from '@/features/auth/queries'
import { EditProjectForm } from '@/features/projects/components/edit-project-form';
import { getProject } from '@/features/projects/queries';
import { redirect } from 'next/navigation';
import React from 'react'

interface ProjectIdSettingsPageProps {
    params: Promise<{
        projectId: string;
    }>
}

const ProjectIdSettingsPage =  async ({params}:ProjectIdSettingsPageProps) => {
    const user = await getCurrent();
    if(!user) redirect("/sign-in");

    const projectId = (await params).projectId;
    const project = await getProject({projectId});
    const initialValues = {
      ...project,
    };

  return (
    <div className='w-full lg:max-w-xl'>
        <EditProjectForm initialValues={initialValues}/>
    </div>
  )
}

export default ProjectIdSettingsPage