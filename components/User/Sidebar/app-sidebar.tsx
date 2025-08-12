// import type { ColumnFiltersState } from '@tanstack/react-table';
// import { useQueryState } from 'next-usequerystate';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  //   SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { signOutAction } from '@/lib/server-actions/admin/admin-auth-actions';

// import { enrollmentStatus, paymentStatus } from '@/utils/db/schema/enums';
// import { SearchForm } from '../search-form';
// import { VersionSwitcher } from '../version-switcher';

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
      <SidebarRail />
    </Sidebar>
  );
}
