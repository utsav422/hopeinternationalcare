import type { NavigationMenuProps } from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export const NavMenu = (props: NavigationMenuProps) => {
  const pathname = usePathname();
  const [isScrolling, setIsScrolling] = useState(false);
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList
        className={cn(
          'gap-1 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start md:gap-4',
          pathname !== '/' && 'text-primary'
        )}
      >
        <NavigationMenuItem
          className={cn(
            'rounded-md p-3 hover:bg-teal-500/10',
            !isScrolling && pathname === '/' && 'hover:bg-teal-500/10'
          )}
        >
          <NavigationMenuLink asChild>
            <Link href="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem
          className={cn(
            'rounded-md p-3 hover:bg-teal-500/10',
            !isScrolling && pathname === '/' && 'hover:bg-teal-500/10'
          )}
        >
          <NavigationMenuLink asChild>
            <Link href="/aboutus">About Us</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem
          className={cn(
            'rounded-md p-3 hover:bg-teal-500/10',
            !isScrolling && pathname === '/' && 'hover:bg-teal-500/10'
          )}
        >
          <NavigationMenuLink asChild>
            <Link href="/courses">Our Courses</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem
          className={cn(
            'rounded-md p-3 hover:bg-teal-500/10',
            !isScrolling && pathname === '/' && 'hover:bg-teal-500/10'
          )}
        >
          <NavigationMenuLink asChild>
            <Link href="contactus">Contact Us</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
