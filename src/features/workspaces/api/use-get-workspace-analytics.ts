import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

interface UseGetWorkspaceAnalyticsProps {
  workspaceId: string;
}

export const useGetWorkspaceAnalytics = ({
  workspaceId
}: UseGetWorkspaceAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"].analytics.$get({
        param: { workspaceId }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Workspace Analytics")
      }

      const { data } = await response.json();

      return data;
    }
  })

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch Workspace Analytics");
    }
  }, [query.isError]);

  return query;
}
