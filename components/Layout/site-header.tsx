import { usePathname } from 'next/navigation';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

const getHrefFromPathname = (pathname: string) => {
  const path = pathname
    .split('/')
    .filter(
      (item) =>
        item !== '' ||
        !['edit', 'new'].includes(item) ||
        !Number.isSafeInteger(Number(item)) ||
        item.length < 7
    );
  if (path.length === 0 || path.includes('admin')) {
    return '/admin';
  }
  return `/admin/${path.at(-1)}`;
};
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-2 h-4" orientation="vertical" />
      <Breadcrumb>
        <BreadcrumbList>
          {pathname.split('/').map((item, index) => {
            if (item === '') {
              return null;
            }
            const href = getHrefFromPathname(item);
            const isActive = index === pathname.split('/').length - 1;
            return (
              <React.Fragment key={index + item}>
                <BreadcrumbItem
                  className={isActive ? 'text-muted-foreground' : ''}
                >
                  <BreadcrumbLink
                    aria-disabled={
                      pathname.split('/').length - 1 === index
                        ? 'true'
                        : 'false'
                    }
                    className={isActive ? 'text-muted-foreground' : ''}
                    href={`${href}`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathname.length > 1 &&
                  pathname.split('/').length - 1 !== index && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
