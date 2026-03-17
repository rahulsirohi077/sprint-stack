"use client"
import { createProjectSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "../api/use-create-projects";
import { useRef } from "react";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface CreateProjectFormProps {
    onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useCreateProject();

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: "",
            workspaceId: workspaceId
        }
    })

    const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
        const finalValues = {
            ...values,
            workspaceId,
            image: values.image instanceof File ? values.image : "",
        };

        mutate({ form: finalValues }, {
            onSuccess: ({ data }) => {
                form.reset();
                router.push(`/workspaces/${workspaceId}/projects/${data.$id}`)
                // onCancel?.();
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    }

    return (
        <Card className="w-full h-full shadow-none border-none">
            <CardHeader className="flex">
                <CardTitle className="text-xl font-bold">
                    Create a new project
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
                                        <FormLabel>Project name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter project name"
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-y-2">
                                        <div className="flex items-center gap-x-5">
                                            {field.value ? (
                                                <div className="size-18 relative rounded-md overflow-hidden">
                                                    <Image
                                                        alt="logo"
                                                        fill
                                                        className="object-cover"
                                                        src={
                                                            field.value instanceof File
                                                                ? URL.createObjectURL(field.value)
                                                                : field.value
                                                        } />
                                                </div>
                                            ) : (
                                                <Avatar className="size-18">
                                                    <AvatarFallback>
                                                        <ImageIcon className="size-9 text-neutral-400" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="flex flex-col">
                                                <p className="text-sm">Project Icon</p>
                                                <p className="text-sm text-muted-foreground">
                                                    JPG, PNG, SVG or JPEG, max 1mb
                                                </p>
                                                <input
                                                    className="hidden"
                                                    type="file"
                                                    accept=".jpg, .png, .jpeg, .svg"
                                                    ref={inputRef}
                                                    onChange={handleImageChange}
                                                    disabled={isPending}
                                                />
                                                {field.value ? (
                                                    <Button
                                                        type="button"
                                                        disabled={isPending}
                                                        variant={'destructive'}
                                                        size={'xs'}
                                                        className="w-fit mt-2"
                                                        onClick={() => {
                                                            field.onChange(null);
                                                            if(inputRef.current){
                                                                inputRef.current.value = "";
                                                            }
                                                        }}
                                                    >
                                                        Remove Image
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        disabled={isPending}
                                                        variant={'teritary'}
                                                        size={'xs'}
                                                        className="w-fit mt-2"
                                                        onClick={() => inputRef.current?.click()}
                                                    >
                                                        Upload Image
                                                    </Button>
                                                )}

                                            </div>
                                        </div>
                                    </div>
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
                                Create Project
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}