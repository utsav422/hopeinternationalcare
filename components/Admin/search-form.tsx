import { Search } from 'lucide-react';
import type React from 'react';

import { Label } from '@/components/ui/label';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar';

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label className="sr-only" htmlFor="search">
            Search
          </Label>
          <SidebarInput
            className="pl-8 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            id="search"
            placeholder="Search the docs..."
          />
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 size-4 select-none opacity-50 dark:text-gray-400" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
