import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'
import { Loader } from 'lucide-react';
import React from 'react'
import { CreateTaskForm } from './create-task-form';

interface CreateTaskFormWrapperProps {
  onCancel: () => void
}

const CreateTaskFormWrapper = ({
  onCancel
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  
  const {data: projects, isLoading: isLoadingProjects } = useGetProjects({workspaceId});
  const {data: members, isLoading: isLoadingMembers } = useGetMembers({workspaceId});

  const projectOptions = projects?.rows.map((project)=>(
    {
      id: project.$id,
      name: project.name,
      imageUrl: project.imageUrl
    }
  ))

  const memberOptions = members?.rows.map((member)=>(
    {
      id: member.$id,
      name: member.name,
    }
  ))

  const isLoading = isLoadingMembers || isLoadingProjects;

  if(isLoading){
    return (
      <Card>
        <CardContent className='w-full h-178.5 border-none shadow-none flex items-center justify-center'>
          <Loader className='size-5 animate-spin text-muted-foreground'/>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
       <CreateTaskForm
          onCancel={onCancel}
          projectOptions={projectOptions ?? []}
          memberOptions={memberOptions ?? []}
       />
    </div>
  )
}

export default CreateTaskFormWrapper