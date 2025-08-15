"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import {
    IconCreditCard,
    IconDotsVertical,
    IconLogout,
    IconNotification,
    IconUserCircle,
} from "@tabler/icons-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    useSidebar,
} from "@/components/ui/sidebar"
import { SidebarFooter } from "@/components/ui/sidebar"
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { signOutAction } from '@/lib/server-actions/admin/admin-auth-actions';
import { IconInnerShadowTop } from '@tabler/icons-react';
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type SubNavItem = {
    title: string;
    url: string;
    isActive: boolean;
    onClick?: () => void;
};

type NavMainItem = {
    title: string;
    url: string;
    isActive: boolean;
    items?: SubNavItem[];
};

export function AdminAppSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const data = {
        user: {
            name: "Aaasha Bhattarai",
            email: "bhattaraiaasha3739@gmail.com",
            avatar: "/image/admin-avatar.png",
        },
        navMain: [
            {
                title: 'General',
                url: '#',
                icon: undefined,
                isActive: false, // Added isActive property
                sub_items: [
                    {
                        title: 'Dashboard',
                        icon: undefined,
                        url: '/admin',
                        isActive: false,
                    },
                    {
                        title: 'Users',
                        url: '/admin/users',
                        icon: undefined,
                        isActive: false,
                    },
                    {
                        title: 'Categories',
                        url: '/admin/categories',
                        icon: undefined,
                        isActive: false,
                    },
                    {
                        title: 'Courses',
                        url: '/admin/courses',
                        icon: undefined,
                        isActive: false,
                    },
                    {
                        title: 'Intakes',
                        url: '/admin/intakes',
                        icon: undefined,
                        isActive: false,
                    },
                    {
                        title: 'Enrollments',
                        url: '/admin/enrollments',
                        icon: undefined,
                        isActive: false,
                    },
                    {
                        title: 'Customer Contact Request',
                        url: '/admin/customer-contact-requests',
                        icon: undefined,
                        isActive: false,
                    },

                ],
            },
        ],
    };
    return (
        <Sidebar collapsible="offcanvas" {...props}>

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">Hope Internation Care ORG.</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}


function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: Icon
        isActive: boolean
        sub_items?: {

            title: string
            url: string
            icon?: Icon
            isActive: boolean
        }[]
    }[]
}) {
    return (<>
        {items.map((item) => (
            <SidebarGroup key={item.title}>
                <SidebarGroupLabel className="">
                    {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {item.sub_items?.map((subNavItem) => (
                            <SidebarMenuItem key={subNavItem.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={subNavItem.isActive}
                                >
                                    <a className="capitalize" href={subNavItem.url}>
                                        {subNavItem.title}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        ))}
    </>

    )
}




export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()
    const router = useRouter();
    const handleApplicationSignOut = async () => {
        const { error, message, success } = await signOutAction();
        if (!success && error) {
            toast.error(error)
        } else {
            toast.success(message);
            router.push('/admin-auth/sign-in', {
                scroll: false
            })
        }
    }
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <ThemeSwitcher />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleApplicationSignOut} className="text-red-600"
                        >

                            <IconLogout className="text-red-600" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu >
    )
}
