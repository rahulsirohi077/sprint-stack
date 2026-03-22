import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

interface UseGetWorkspaceProps {
  workspaceId: string;
}

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  const query = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"].$get({
        param: { workspaceId }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Workspace")
      }

      const { data } = await response.json();

      return data;
    }
  })

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch Workspace");
    }
  }, [query.isError]);

  return query;
}