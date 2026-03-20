import { useState } from "react"
import { Task, TaskStatus } from "../types"
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from "@hello-pangea/dnd"
import { KanbanColumnHeader } from "./kanban-column-header"


const boards:TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
]

interface DataKanbanProps {
    data: Task[]
}

type TasksState = {
    [key in TaskStatus] : Task[]
}

export const DataKanban = ({
    data
}: DataKanbanProps) => {
    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            initialTasks[task.status].push(task);
        });

        Object.values(initialTasks).forEach((tasks) => {
            tasks.sort((a, b) => a.position - b.position);
        });

        return initialTasks;
    });


    return (
        <DragDropContext onDragEnd={()=>{}}>
            <div className="flex overflow-x-auto">
                {boards.map((board)=>{
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-50">
                            <KanbanColumnHeader 
                                board={board}
                                taskCount={tasks[board].length}
                            />
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
}