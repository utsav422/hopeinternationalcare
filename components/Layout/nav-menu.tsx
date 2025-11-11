'use client';
import type { NavigationMenuProps } from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export const NavMenu = ({
    isHomePage,
    ...navProps
}: NavigationMenuProps & { isHomePage?: boolean }) => {
    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/aboutus', label: 'About Us' },
        { href: '/courses', label: 'Our Courses' },
        { href: '/contactus', label: 'Contact Us' },
    ];

    const socialLinks = [
        { href: '#', icon: Facebook, label: 'Facebook' },
        { href: '#', icon: Instagram, label: 'Instagram' },
        { href: '#', icon: Youtube, label: 'YouTube' },
    ];

    return (
        <NavigationMenu {...navProps}>
            <NavigationMenuList
                className={cn(
                    'flex-col items-start gap-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start sm:flex-row sm:items-center sm:gap-4 md:gap-6'
                )}
            >
                {navItems.map(item => (
                    <NavigationMenuItem
                        key={item.href}
                        className={cn(
                            'rounded-md px-3 py-2 text-base font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm md:px-5 md:py-3 md:text-base'
                        )}
                    >
                        <NavigationMenuLink asChild>
                            <Link href={item.href}>{item.label}</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}

                {/* Social Icons - Visible on medium screens and larger */}
                <NavigationMenuItem className="hidden md:flex md:items-center md:gap-3">
                    {socialLinks.map((social, index) => {
                        const Icon = social.icon;
                        return (
                            <NavigationMenuLink asChild key={index}>
                                <Link
                                    href={social.href}
                                    aria-label={social.label}
                                    className={cn(
                                        'rounded-full p-2 transition-colors'
                                    )}
                                >
                                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                                </Link>
                            </NavigationMenuLink>
                        );
                    })}
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};
