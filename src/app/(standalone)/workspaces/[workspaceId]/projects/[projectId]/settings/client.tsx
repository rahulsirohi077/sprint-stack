"use client";

import PageError from "@/components/page-error";
import PageLoader from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const ProjectIdSettingsClient = () => {
  const projectId = useProjectId();
  const { data: project, isPending } = useGetProject({ projectId });

  if (isPending) {
    return <PageLoader />;
  }

  if (!project) {
    return <PageError message="Project Not Found" />;
  }

  return <EditProjectForm initialValues={project} />;
};