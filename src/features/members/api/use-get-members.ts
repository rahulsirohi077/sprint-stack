import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

interface UseGetMembersProps {
    workspaceId: string;

}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
    const query = useQuery({
        queryKey: ['members', workspaceId],
        queryFn: async () => {
            const response = await client.api.members.$get({ query: { workspaceId } });

            if (!response.ok) {
                throw new Error("Failed to fetch Members")
            }

            const { data } = await response.json();

            return data;
        }
    })

    useEffect(() => {
        if (query.isError) {
            toast.error("Failed to fetch Members");
        }
    }, [query.isError]);

    return query;
}