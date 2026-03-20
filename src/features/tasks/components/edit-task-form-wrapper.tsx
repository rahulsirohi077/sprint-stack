import { Card, CardContent } from '@/components/ui/card';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { Loader } from 'lucide-react';
import { useGetTask } from '../api/use-get-task';
import { EditTaskForm } from './edit-task-form';

interface EditTaskFormWrapperProps {
    taskId: string;
    onCancel: () => void;
}

const EditTaskFormWrapper = ({ taskId, onCancel }: EditTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId();

    const { data: projects, isPending: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isPending: isLoadingMembers } = useGetMembers({ workspaceId });

    const { data: initialValues, isPending: isLoadingTask} = useGetTask({taskId});

    const projectOptions = projects?.rows.map((project) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl
    }));

    const memberOptions = members?.rows.map((member) => ({
        id: member.$id,
        name: member.name,
    }));

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

    if (isLoading) {
        return (
            <Card>
                <CardContent className='w-full h-178.5 border-none shadow-none flex items-center justify-center'>
                    <Loader className='size-5 animate-spin text-muted-foreground' />
                </CardContent>
            </Card>
        );
    }

    if(!initialValues) {
        return null;
    }

    return (
        <EditTaskForm
            onCancel={onCancel}
            projectOptions={projectOptions ?? []}
            memberOptions={memberOptions ?? []}
            initialValues={initialValues}
        />
    );
};

export default EditTaskFormWrapper;
