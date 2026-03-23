import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

interface UseGetProjectAnalyticsProps {
  projectId: string;
}

export const useGetProjectAnalytics = ({
  projectId
}: UseGetProjectAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      const response = await client.api.projects[":projectId"].analytics.$get({
        param: { projectId }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Project Analytics")
      }

      const { data } = await response.json();

      return data;
    }
  })

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch Project Analytics");
    }
  }, [query.isError]);

  return query;
}
