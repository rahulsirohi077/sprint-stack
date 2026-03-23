import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

interface UseGetProjectsProps {
    workspaceId:string;
}

export const useGetProjects = ({
    workspaceId
}:UseGetProjectsProps) => {
    const query = useQuery({
        queryKey: ['projects',workspaceId],
        enabled: !!workspaceId,
        queryFn: async () => {
            const response = await client.api.projects.$get({
                query: {workspaceId}
            });

            if(!response.ok) {
                throw new Error("Failed to fetch Projects")
            }

            const {data} = await response.json();

            return data;
        }
    })

    useEffect(() => {
        if (query.isError) {
            toast.error("Failed to fetch Projects");
        }
    }, [query.isError]);

    return query;
}