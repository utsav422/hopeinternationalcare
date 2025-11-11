'use client';
import { VersionSwitcher } from '@/components/Admin/version-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useAuthSession } from '@/hooks/use-auth-session';
import { signOutAction } from '@/lib/server-actions/user/user-auth-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import {
    IconDotsVertical,
    IconInnerShadowTop,
    IconLogout,
} from '@tabler/icons-react';
import { notFound, usePathname } from 'next/navigation';

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

export function UserAppSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    const { user: sessionUser } = useAuthSession();
    if (!sessionUser) {
        return notFound();
    }
    const user = {
        name: sessionUser?.user_metadata.name as string,
        email: sessionUser?.email as string,
        avatar: '/image/admin-avatar.png',
    };
    const isActiveUrl = (url?: string) => {
        if (!url) return false;
        if (!pathname) return false;
        return pathname === url;
    };
    const data: { navMain: NavMainItem[] } = {
        navMain: [
            {
                title: 'Application',
                url: '#',
                isActive: false, // Added isActive property
                items: [
                    {
                        title: 'Profile',
                        url: '/users/profile',
                        isActive: isActiveUrl('/users/profile'),
                    },
                    {
                        title: 'My Enrollments',
                        url: '/users/enrollments',
                        isActive: isActiveUrl('/users/enrollments'),
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
                                <span className="font-semibold">
                                    Hope Internation Care ORG.
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {data.navMain.map(nav => (
                    <SidebarGroup key={nav.title}>
                        <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {nav.items?.map(subNavItem => {
                                    const selfActive = isActiveUrl(
                                        subNavItem.url
                                    );
                                    return (
                                        <SidebarMenuItem key={subNavItem.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={subNavItem.isActive}
                                                onClick={subNavItem.onClick}
                                            >
                                                <a
                                                    className="capitalize"
                                                    href={subNavItem.url}
                                                >
                                                    {subNavItem.title}
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
        </Sidebar>
    );
}

export function NavUser({
    user,
}: {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}) {
    const { isMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="">
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg grayscale ">
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                />
                                <AvatarFallback className="rounded-lg">
                                    CN
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight ">
                                <span className="truncate font-medium">
                                    {user.name}
                                </span>
                                <span className="truncate text-xs ">
                                    {user.email}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'top'}
                        align="end"
                        sideOffset={10}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        CN
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>
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
                        <DropdownMenuItem>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2 text-start w-full hover:bg-red-500/55"
                                onClick={signOutAction}
                            >
                                <IconLogout />
                                Logout
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
