import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import React from "react";
import WorkspaceIdJoinClient from "./client";

const WorkspaceIdJoinPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className='w-full lg:max-w-xl'>
      <WorkspaceIdJoinClient />
    </div>
  );
};

export default WorkspaceIdJoinPage;
