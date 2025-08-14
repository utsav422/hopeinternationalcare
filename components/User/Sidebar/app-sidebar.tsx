'use client'
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    //   SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { useAuthSession } from '@/hooks/use-auth-session';
import { signOutAction } from '@/lib/server-actions/user/user-auth-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { IconDotsVertical, IconLogout } from '@tabler/icons-react';
import { notFound } from 'next/navigation';

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
    const { user: sessionUser } = useAuthSession()
    if (!sessionUser) {
        return notFound()
    }
    const user = {
        name: sessionUser?.user_metadata.name as string,
        email: sessionUser?.email as string,
        avatar: "/image/admin-avatar.png",
    }
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
                        isActive: false,
                    },
                    {
                        title: 'My Enrollments',
                        url: '/user/enrollments',
                        isActive: false,
                    },
                ],
            },
        ],
    };
    return (
        <Sidebar {...props}>
            {/* <SidebarHeader>
        <VersionSwitcher
          defaultVersion={data.versions[0]}
          versions={data.versions}
        />
        <SearchForm />
      </SidebarHeader> */}
            <SidebarContent>
                {data.navMain.map((nav) => (
                    <SidebarGroup key={nav.title}>
                        <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {nav.items?.map((subNavItem) => (
                                    <SidebarMenuItem key={subNavItem.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={subNavItem.isActive}
                                            onClick={subNavItem.onClick}
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
                <Button onClick={signOutAction}>Logout</Button>
            </SidebarContent>
            <SidebarFooter>
                <Button
                    className="dark:bg-red-600  dark:hover:bg-red-700"
                    onClick={signOutAction}
                >
                    Logout
                </Button>
                {user && <NavUser user={user} />}
            </SidebarFooter>
        </Sidebar>
    );
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
                                {/* <IconUserCircle /> */}
                                <ThemeSwitcher />
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                                <IconCreditCard />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <IconNotification />
                                Notifications
                            </DropdownMenuItem> */}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={signOutAction} className="text-red-600"
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