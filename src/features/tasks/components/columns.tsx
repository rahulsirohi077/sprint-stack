"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MemberAvatar from "@/features/members/components/members-avatar";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { Task, TaskTableRow } from "../types";
import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";

const statusBadgeClassName: Record<Task["status"], string> = {
  BACKLOG: "bg-muted text-muted-foreground",
  TODO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  IN_REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  DONE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export const columns: ColumnDef<TaskTableRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => {
        const name = row.original.name;

        return <p className="line-clamp-1">{name}</p>
    }
  },
  {
    accessorKey: "project",
    header: ({column}) => {
        return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => {
        const project = row.original.project;

        return (
            <div className="flex items-center gap-x-2 text-sm font-medium">
                <ProjectAvatar
                    className="size-6"
                    name={project?.name}
                    image={project?.imageUrl}
                />
                <p className="line-clamp-1">{project?.name}</p>
            </div>
        )
    }
  },
  {
    accessorKey: "assignee",
    header: ({column}) => {
        return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assignee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({row}) => {
        const assignee = row.original.assignee;

        return (
            <div className="flex items-center gap-x-2 text-sm font-medium">
                <MemberAvatar
                    className="size-6"
                    name={assignee?.name ?? "Unknown"}
                />
                <p className="line-clamp-1">{assignee?.name ?? "Unknown"}</p>
            </div>
        )
    }
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <TaskDate value={row.original.dueDate} className="line-clamp-1" />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          variant="secondary"
          className={statusBadgeClassName[status]}
        >
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell:({row}) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;

      return (
        <TaskActions id={id} projectId={projectId}>
            <Button variant={'ghost'} className="size-8 p-0">
              <MoreVertical/>
            </Button>
        </TaskActions>
      )
    }
  }
];
