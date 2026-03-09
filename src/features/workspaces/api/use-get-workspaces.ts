import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

export const useGetWorkspaces = () => {
    const query = useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => {
            const response = await client.api.workspaces.$get();

            if(!response.ok) {
                throw new Error("Failed to fetch Workspaces")
            }

            const {data} = await response.json();

            return data;
        }
    })

    useEffect(() => {
        if (query.isError) {
            toast.error("Failed to fetch current user");
        }
    }, [query.isError]);

    return query;
}