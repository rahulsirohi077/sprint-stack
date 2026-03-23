"use client";

import { Badge } from '@/components/ui/badge';
import MemberAvatar from '@/features/members/components/members-avatar';
import { formatTaskStatus } from '@/lib/utils';
import React from 'react'
import { Task } from '../types';
import { STATUS_BADGE_CLASS_NAME } from '../constants';
import { TaskDate } from './task-date';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { DottedSeparator } from '@/components/dotted-separator';
import { OverviewProperty } from './overview-property';
import { useEditTaskModal } from '../hooks/use-edit-task-modal';

interface TaskOverviewProps {
  task: Task;
}

const TaskOverview = ({ task }: TaskOverviewProps) => {
    const { open } = useEditTaskModal();

  return (
    <div className='flex flex-col gap-y-4 col-span-1'>
        <div className='bg-muted rounded-lg p-4'>
            <div className='flex items-center justify-between'>
                <p className='text-lg font-semibold'>Overview</p>
                        <Button size={'sm'} variant={'secondary'} onClick={() => open(task.$id)}>
                <PencilIcon className='size-4 mr-2'/>
                Edit
            </Button>
            </div>
            <DottedSeparator className='my-4'/>
            <div className='flex flex-col gap-y-4'>
                <OverviewProperty label='Assignee'>
                    <MemberAvatar
                        name={task.assignee?.name}
                        className='size-6'
                    />
                    <p className='text-sm font-medium'>{task.assignee?.name ?? 'Unknown'}</p>
                </OverviewProperty>

                <OverviewProperty label='Due Date'>
                    <TaskDate value={task.dueDate} className='text-sm font-medium'/>
                </OverviewProperty>

                <OverviewProperty label='Status'>
                    <Badge variant='secondary' className={STATUS_BADGE_CLASS_NAME[task.status]}>
                        {formatTaskStatus(task.status)}
                    </Badge>
                </OverviewProperty>

            </div>

        </div>
    </div>
  )
}

export default TaskOverview