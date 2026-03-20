import { Button } from "@/components/ui/button";
import { TaskStatus } from "../types";
import { CircleIcon, CircleCheckIcon, CircleDotIcon, CircleDashedIcon, CircleDotDashedIcon, PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

interface KanbanColumnHeaderProps {
    board: TaskStatus;
    taskCount: number;
}

const statusConfig: Record<
    TaskStatus,
    { label: string; icon: React.ElementType; color: string }
> = {
    [TaskStatus.BACKLOG]: {
        label: "Backlog",
        icon: CircleDashedIcon,
        color: "text-pink-400",
    },
    [TaskStatus.TODO]: {
        label: "Todo",
        icon: CircleIcon,
        color: "text-red-400",
    },
    [TaskStatus.IN_PROGRESS]: {
        label: "In Progress",
        icon: CircleDotDashedIcon,
        color: "text-yellow-400",
    },
    [TaskStatus.IN_REVIEW]: {
        label: "In Review",
        icon: CircleDotIcon,
        color: "text-blue-400",
    },
    [TaskStatus.DONE]: {
        label: "Done",
        icon: CircleCheckIcon,
        color: "text-emerald-400",
    },
};

export const KanbanColumnHeader = ({ board, taskCount }: KanbanColumnHeaderProps) => {
    const {
       open 
    } = useCreateTaskModal();
    const { label, icon: Icon, color } = statusConfig[board];

    return (
        <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-x-2">
                <Icon className={`size-4.5 ${color}`} />
                <h2 className="text-sm font-medium">{label}</h2>
            </div>
            <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
                {taskCount}
            </div>
            <Button onClick={open} variant={'ghost'} size={'icon'} className="size-5 hover:bg-neutral-200">
                <PlusIcon className="size-4 text-neutral-500"/>
            </Button>
        </div>
    );
};

export default KanbanColumnHeader;