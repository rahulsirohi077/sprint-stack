"use client";

import { SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";

import { cn } from "@/lib/utils";

const routes = [
    {
        label: "Home",
        href: "/",
        icon: GoHome,
        activeIcon: GoHomeFill
    },
    {
        label: "My Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activeIcon: UsersIcon
    }
] as const;

const Navigation = () => {
    const pathname = usePathname();
    const workspaceId = usePathname();


    return (
        <ul className="flex flex-col gap-y-1">
            {routes.map((route) => {
                const fullHref = `/workspaces/${workspaceId}${route.href}`
                const isActive = pathname === fullHref;
                const Icon = isActive ? route.activeIcon : route.icon;

                return (
                    <li key={fullHref}>
                        <Link
                            href={route.href}
                            className={cn(
                                "flex items-center gap-x-2.5 rounded-md px-3 py-2 text-sm font-medium transition hover:text-primary text-neutral-500",
                                isActive
                                    ? "bg-white hover:opacity-100 text-primary shadow-sm"
                                    : "text-neutral-600 hover:bg-white/70 hover:text-neutral-900"
                            )}
                        >
                            <Icon className="size-4 text-neutral-500" />
                            <span>{route.label}</span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default Navigation;