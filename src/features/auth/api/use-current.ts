import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

export const useCurrent = () => {
    const query = useQuery({
        queryKey: ['current'],
        queryFn: async () => {
            const response = await client.api.auth.current.$get();

            if(!response.ok) {
                return null;
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