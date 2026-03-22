"use client"
import { ResponsiveModal } from "@/components/responsive-modal";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import EditTaskFormWrapper from "./edit-task-form-wrapper";


export const EditTaskModal = () => {
    const { taskId, close, setTaskId } = useEditTaskModal();

    return (
        <ResponsiveModal open={!!taskId} onOpenChange={(open) => { if (!open) close(); }} title={"Edit Task"}>
            {taskId && <EditTaskFormWrapper taskId={taskId} onCancel={close} />}
        </ResponsiveModal>
    )
}