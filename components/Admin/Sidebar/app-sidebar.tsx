// import type { ColumnFiltersState } from '@tanstack/react-table';
// import { useQueryState } from 'next-usequerystate';
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
// import { enrollmentStatus, paymentStatus } from '@/utils/db/schema/enums';
import { SearchForm } from '../search-form';
import { VersionSwitcher } from '../version-switcher';

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
  const data: { versions: string[]; navMain: NavMainItem[] } = {
    versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
    navMain: [
      {
        title: 'General',
        url: '#',
        isActive: false, // Added isActive property
        items: [
          {
            title: 'Dashboard',
            url: '/admin',
            isActive: false,
          },
          {
            title: 'Users',
            url: '/admin/users',
            isActive: false,
          },
          {
            title: 'Courses',
            url: '/admin/courses',
            isActive: false,
          },
          {
            title: 'Intakes',
            url: '/admin/intakes',
            isActive: false,
          },
          {
            title: 'Categories',
            url: '/admin/categories',
            isActive: false,
          },
          {
            title: 'Enrollments',
            url: '/admin/enrollments',
            isActive: false,
          },
        ],
      },
    ],
  };
  return (
    <Sidebar
      {...props}
      className="dark:border-gray-700 dark:border-r dark:bg-gray-800"
    >
      <SidebarHeader>
        <VersionSwitcher
          defaultVersion={data.versions[0]}
          versions={data.versions}
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((nav) => (
          <SidebarGroup key={nav.title}>
            <SidebarGroupLabel className="dark:text-gray-400">
              {nav.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.items?.map((subNavItem) => (
                  <SidebarMenuItem key={subNavItem.title}>
                    <SidebarMenuButton
                      asChild
                      className="dark:text-gray-300 dark:data-[active=true]:bg-gray-700 dark:focus:bg-gray-700 dark:hover:bg-gray-700"
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
        <Button
          className="dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
          onClick={signOutAction}
        >
          Logout
        </Button>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
