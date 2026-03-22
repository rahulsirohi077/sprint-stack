"use client";

import PageError from "@/components/page-error";
import PageLoader from "@/components/page-loader";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import JoinWorkspaceForm from "@/features/workspaces/components/join-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

const WorkspaceIdJoinClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspaceInfo, isPending } = useGetWorkspaceInfo({ workspaceId });

  if (isPending) {
    return <PageLoader />;
  }

  if (!workspaceInfo) {
    return <PageError message="Workspace Not Found" />;
  }

  return <JoinWorkspaceForm initialValues={workspaceInfo} />;
};

export default WorkspaceIdJoinClient;