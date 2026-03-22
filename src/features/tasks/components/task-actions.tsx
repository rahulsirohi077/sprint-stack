import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteTask } from "../api/use-delete-task";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";


interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode
}

export const TaskActions = ({
    id,
    projectId,
    children
}:TaskActionsProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { open } = useEditTaskModal();

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Task",
        "This action cannot be undone",
        "destructive"
    );

    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();

    const handleDeleteTask = async () => {
        const ok = await confirmDelete();

        if (!ok) {
            return;
        }

        deleteTask({
            param: { taskId: id }
        });
    };

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    }

    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`)
    }

    const onOpenEditModal = () => {
        open(id);
    }

    return (
        <div className="flex justify-end">
            <DeleteDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={onOpenTask} 
                        className="font-medium p-2.5"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2"/>
                        Task Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onOpenProject} 
                        className="font-medium p-2.5"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2"/>
                        Open Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onOpenEditModal}
                        className="font-medium p-2.5"
                    >
                        <PencilIcon className="size-4 mr-2 stroke-2"/>
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleDeleteTask}
                        disabled={isDeletingTask}
                        className="text-amber-700 focus:text-amber-700 font-medium p-2.5"
                    >
                        <TrashIcon className="size-4 mr-2 stroke-2 text-amber-700"/>
                        Delete Task
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    )
}