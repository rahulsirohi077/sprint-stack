"use client"
import { DottedSeparator } from "@/components/dotted-separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useCreateTask } from "../api/use-create-task";
import { createTaskSchema } from "../schema";

interface CreateTaskFormProps {
    onCancel?: () => void;
    projectOptions: {id:string,name:string, imageUrl:string | undefined}[],
    memberOptions: {id:string,name:string}[]
}

export const CreateTaskForm = ({ onCancel, projectOptions, memberOptions }: CreateTaskFormProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useCreateTask();

    const form = useForm<
        z.input<typeof createTaskSchema>,
        unknown,
        z.output<typeof createTaskSchema>
    >({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            workspaceId: workspaceId
        }
    })

    const onSubmit = (values: z.output<typeof createTaskSchema>) => {
        mutate({ json: {...values, workspaceId} }, {
            onSuccess: ({ data }) => {
                form.reset();
                // TODO: redirect to new task 
            }
        })
    }

    return (
        <Card className="w-full h-full shadow-none border-none">
            <CardHeader className="flex">
                <CardTitle className="text-xl font-bold">
                    Create a new Task
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter Task name"
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DottedSeparator className="px-7" />
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size={'lg'}
                                variant={'secondary'}
                                onClick={onCancel}
                                className={cn(!onCancel && "invisible")}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size={'lg'}
                                disabled={isPending}
                            >
                                Create Task
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}