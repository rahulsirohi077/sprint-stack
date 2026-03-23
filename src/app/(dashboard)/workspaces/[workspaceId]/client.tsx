'use client'

import { Analytics } from "@/components/analytics";
import { DottedSeparator } from "@/components/dotted-separator";
import PageError from "@/components/page-error";
import PageLoader from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import MemberAvatar from "@/features/members/components/members-avatar";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { STATUS_BADGE_CLASS_NAME } from "@/features/tasks/constants";
import { TaskDate } from "@/features/tasks/components/task-date";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { formatTaskStatus } from "@/lib/utils";
import { ArrowRightIcon, FolderPlusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

interface DashboardProject {
    $id: string;
    name: string;
    imageUrl?: string;
}

interface DashboardMember {
    $id: string;
    name: string;
    email: string;
}

export const WorkspaceIdClient = () => {
    const workspaceId = useWorkspaceId();

    const { data: analytics, isPending: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
    const { data: tasks, isPending: isLoadingTasks } = useGetTasks({ workspaceId });
    const { data: projects, isPending: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isPending: isLoadingMembers } = useGetMembers({ workspaceId });

    const { open: createProject } = useCreateProjectModal();
    const { open: createTask } = useCreateTaskModal();

    const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;

    if (isLoading) {
        return <PageLoader />;
    }

    if (!analytics || !tasks || !projects || !members) {
        return <PageError message="Failed to Load workspace data" />;
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <Analytics data={analytics} />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <TaskList
                    data={tasks.rows}
                    total={tasks.total}
                    workspaceId={workspaceId}
                    onCreateTask={createTask}
                />
                <WorkspaceOverview
                    workspaceId={workspaceId}
                    projects={projects.rows}
                    members={members.rows}
                    onCreateProject={createProject}
                    onCreateTask={createTask}
                />
            </div>
        </div>
    );
}

interface TaskListProps {
    data: Task[];
    total: number;
    workspaceId: string;
    onCreateTask: () => void;
}

const TaskList = ({ data, total, workspaceId, onCreateTask }: TaskListProps) => {
    const recentTasks = data.slice(0, 5);

    return (
        <Card className="col-span-1 xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>Recent Tasks</CardTitle>
                    <p className="text-sm text-muted-foreground">{total} tasks across this workspace</p>
                </div>
                <Button size="sm" onClick={onCreateTask}>
                    <PlusIcon className="size-4" />
                    New Task
                </Button>
            </CardHeader>
            <CardContent>
                {recentTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-10 text-center">
                        <p className="text-sm text-muted-foreground">No tasks yet in this workspace.</p>
                        <Button size="sm" onClick={onCreateTask}>
                            <PlusIcon className="size-4" />
                            Create your first task
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-y-4">
                        {recentTasks.map((task, index) => (
                            <div key={task.$id}>
                                <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                                    <div className="flex flex-col gap-3 rounded-lg p-3 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0 space-y-2">
                                            <p className="truncate font-medium">{task.name}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                {task.project && (
                                                    <div className="flex items-center gap-2">
                                                        <ProjectAvatar
                                                            image={task.project.imageUrl}
                                                            name={task.project.name}
                                                            className="size-6"
                                                            fallbackClassName="text-xs"
                                                        />
                                                        <span className="truncate">{task.project.name}</span>
                                                    </div>
                                                )}
                                                {task.assignee && (
                                                    <div className="flex items-center gap-2">
                                                        <MemberAvatar name={task.assignee.name} className="size-6" />
                                                        <span>{task.assignee.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS_NAME[task.status]}`}>
                                                {formatTaskStatus(task.status)}
                                            </span>
                                            <TaskDate value={task.dueDate} className="text-sm" />
                                        </div>
                                    </div>
                                </Link>
                                {index < recentTasks.length - 1 && <DottedSeparator className="my-1" />}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

interface WorkspaceOverviewProps {
    workspaceId: string;
    projects: DashboardProject[];
    members: DashboardMember[];
    onCreateProject: () => void;
    onCreateTask: () => void;
}

const WorkspaceOverview = ({
    workspaceId,
    projects,
    members,
    onCreateProject,
    onCreateTask,
}: WorkspaceOverviewProps) => {
    const recentProjects = projects.slice(0, 4);
    const recentMembers = members.slice(0, 4);

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Workspace Overview</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" onClick={onCreateProject}>
                        <FolderPlusIcon className="size-4" />
                        New Project
                    </Button>
                    <Button size="sm" variant="secondary" onClick={onCreateTask}>
                        <PlusIcon className="size-4" />
                        New Task
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Projects</p>
                        <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="mt-2 text-2xl font-semibold">{members.length}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Recent Projects</p>
                        {projects.length > 0 ? (
                            <Link href={`/workspaces/${workspaceId}/projects/${projects[0].$id}`} className="text-xs text-muted-foreground hover:text-foreground">
                                Open latest
                            </Link>
                        ) : (
                            <span className="text-xs text-muted-foreground">No projects</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        {recentProjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No projects created yet.</p>
                        ) : (
                            recentProjects.map((project) => (
                                <Link key={project.$id} href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                                    <div className="flex items-center justify-between rounded-lg p-2 transition hover:bg-muted/50">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <ProjectAvatar image={project.imageUrl} name={project.name} className="size-8" fallbackClassName="text-xs" />
                                            <p className="truncate text-sm font-medium">{project.name}</p>
                                        </div>
                                        <ArrowRightIcon className="size-4 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Team Members</p>
                        <Link href={`/workspaces/${workspaceId}/members`} className="text-xs text-muted-foreground hover:text-foreground">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {recentMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No members found in this workspace.</p>
                        ) : (
                            recentMembers.map((member) => (
                                <div key={member.$id} className="flex items-center gap-3 rounded-lg p-2">
                                    <MemberAvatar name={member.name} className="size-8" fallbackClassName="text-xs" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{member.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};