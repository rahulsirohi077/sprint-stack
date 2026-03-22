import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

interface UseGetProjectProps {
  projectId: string;
}

export const useGetProject = ({
  projectId
}: UseGetProjectProps) => {
  const query = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await client.api.projects[":projectId"].$get({
        param: { projectId }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Project")
      }

      const { data } = await response.json();

      return data;
    }
  })

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch Project");
    }
  }, [query.isError]);

  return query;
}