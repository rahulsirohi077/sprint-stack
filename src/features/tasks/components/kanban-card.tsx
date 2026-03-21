import { MoreHorizontal } from "lucide-react";
import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import MemberAvatar from "@/features/members/components/members-avatar";
import { TaskDate } from "./task-date";
import ProjectAvatar from "@/features/projects/components/project-avatar";


interface KanbanCardProps {
    task: Task
}

export const KanbanCard = ({task}:KanbanCardProps) => {
    return (
        <div className="bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-x-2">
                <p className="text-sm line-clamp-2">{task.name}</p>
                <TaskActions id={task.$id} projectId={task.projectId}>
                    <Button variant={'ghost'} className="h-fit w-fit p-0 rounded-full">
                        <MoreHorizontal className="size-4.5 stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition"/>
                    </Button>
                </TaskActions>
            </div>
            <DottedSeparator/>
            <div className="flex items-center gap-x-1.5">
                <MemberAvatar
                    name={task.assignee?.name ?? "Unknown User"}
                    fallbackClassName="text-[10px]"
                />
                <div className="size-1 rounded-full bg-neutral-300"/>
                <TaskDate value={task.dueDate} className="text-xs flex"/>
            </div>
            {task.project && (
                <div className="flex items-center gap-x-1.5 -translate-y-1.5">
                    <ProjectAvatar
                        name={task.project.name}
                        image={task.project.imageUrl}
                        fallbackClassName="text-[10px]"
                    />
                    <span className="text-xs font-medium">{task.project.name}</span>
                </div>
            )}
        </div>
    )
}