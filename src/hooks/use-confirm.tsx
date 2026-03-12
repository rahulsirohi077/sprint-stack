"use client"
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VariantProps } from "class-variance-authority";
import { JSX, useState } from "react";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export const useConfirm = (
    title: string,
    message: string,
    variant: ButtonVariant = "primary"
): [() => JSX.Element, () => Promise<boolean>] => {
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

    const confirm = (): Promise<boolean> => {
        return new Promise((resolve) => {
            setPromise({ resolve });
        })
    }

    const handleClose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    }

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    const ConfirmationDialog = (): JSX.Element => (
        <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
            <Card className={"w-full h-full border-none shadow-none"}>
                <CardContent className="pt-8">
                    <CardHeader className="p-0">
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>
                            {message}
                        </CardDescription>
                    </CardHeader>
                    <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                        <Button onClick={handleCancel} variant={"outline"} className="w-full lg:w-auto">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} variant={variant} className="w-full lg:w-auto">
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    )

    return [ConfirmationDialog, confirm]
}