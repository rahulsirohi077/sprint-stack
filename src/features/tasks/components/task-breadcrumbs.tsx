"use client";

import Link from 'next/link';
import React from 'react'
import { ChevronRightIcon, TrashIcon } from 'lucide-react';
import { ProjectsRow } from '@/features/projects/type'
import { Task } from '../types';
import ProjectAvatar from '@/features/projects/components/project-avatar';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';
import { useDeleteTask } from '../api/use-delete-task';
import { useRouter } from 'next/navigation';

interface TaskBreadsCrumbsProps {
    project: ProjectsRow;
    task: Task
}

const TaskBreadsCrumbs = ({
    project,
    task
}:TaskBreadsCrumbsProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Task",
    "This action cannot be undone",
    "destructive"
  );
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();

  const handleDelete = async () => {
    const ok = await confirmDelete();

    if (!ok) {
      return;
    }

    deleteTask(
      { param: { taskId: task.$id } },
      {
        onSuccess: () => {
          router.push(`/workspaces/${workspaceId}/projects/${project.$id}`);
        },
      }
    );
  };

  return (
    <>
      <DeleteDialog />
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-x-2 text-sm overflow-x-auto'>
          <Link
            href={`/workspaces/${workspaceId}/projects/${project.$id}`}
            className='flex items-center gap-x-2 font-medium text-muted-foreground hover:text-primary transition-colors'
          >
            <ProjectAvatar
              name={project.name}
              image={project.imageUrl}
              className='size-6 lg:size-8 shrink-0'
              fallbackClassName='text-xs'
            />
            <span className='text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition truncate'>{project.name}</span>
          </Link>
          <ChevronRightIcon className='size-4 shrink-0 mt-0.5 text-muted-foreground' />
          <span className='font-semibold text-primary truncate'>{task.name}</span>
        </div>
        <Button
          type='button'
          variant='destructive'
          size='sm'
          onClick={handleDelete}
          disabled={isDeletingTask}
          className='shrink-0'
        >
          <TrashIcon className='size-4 mr-2' />
          Delete
        </Button>
      </div>
    </>
  )
}

export default TaskBreadsCrumbs