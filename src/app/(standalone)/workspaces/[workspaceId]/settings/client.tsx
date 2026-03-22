"use client";

import PageError from "@/components/page-error";
import PageLoader from "@/components/page-loader";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace, isPending } = useGetWorkspace({ workspaceId });

  if (isPending) {
    return <PageLoader />;
  }

  if (!workspace) {
    return <PageError message="Workspace Not Found" />;
  }

  return <EditWorkspaceForm initialValues={workspace} />;
};

export default WorkspaceIdSettingsClient;