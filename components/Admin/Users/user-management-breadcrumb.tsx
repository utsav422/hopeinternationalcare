'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Users, UserX, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    isActive?: boolean;
}

export default function UserManagementBreadcrumb() {
    const pathname = usePathname();

    // Generate breadcrumb items based on current path
    const getBreadcrumbItems = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [
            {
                label: 'Admin',
                href: '/admin',
                icon: <Home className="h-4 w-4" />,
            },
        ];

        if (pathname.startsWith('/admin/users')) {
            items.push({
                label: 'Users',
                href: '/admin/users',
                icon: <Users className="h-4 w-4" />,
            });

            if (pathname.includes('/deleted')) {
                items.push({
                    label: 'Deleted Users',
                    href: '/admin/users/deleted',
                    icon: <UserX className="h-4 w-4" />,
                });

                // Check if we're viewing a specific user's history
                const historyMatch = pathname.match(
                    /\/admin\/users\/deleted\/([^\/]+)\/history/
                );
                if (historyMatch) {
                    const userId = historyMatch[1];
                    items.push({
                        label: 'Deletion History',
                        icon: <History className="h-4 w-4" />,
                        isActive: true,
                    });
                }
            }
        }

        return items;
    };

    const breadcrumbItems = getBreadcrumbItems();

    if (breadcrumbItems.length <= 1) {
        return null; // Don't show breadcrumb for simple paths
    }

    return (
        <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {breadcrumbItems.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && (
                        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                    )}

                    {item.href && !item.isActive ? (
                        <Link
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors',
                                'text-gray-600 dark:text-gray-400'
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ) : (
                        <div
                            className={cn(
                                'flex items-center space-x-1',
                                item.isActive
                                    ? 'text-gray-900 dark:text-gray-100 font-medium'
                                    : 'text-gray-600 dark:text-gray-400'
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}

// Specific breadcrumb for user deletion history page
export function UserDeletionHistoryBreadcrumb({
    userId,
    userName,
}: {
    userId: string;
    userName?: string;
}) {
    return (
        <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <Link
                href="/admin"
                className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
                <Home className="h-4 w-4" />
                <span>Admin</span>
            </Link>

            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />

            <Link
                href="/admin/users"
                className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
                <Users className="h-4 w-4" />
                <span>Users</span>
            </Link>

            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />

            <Link
                href="/admin/users/deleted"
                className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
                <UserX className="h-4 w-4" />
                <span>Deleted Users</span>
            </Link>

            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />

            <div className="flex items-center space-x-1 text-gray-900 dark:text-gray-100 font-medium">
                <History className="h-4 w-4" />
                <span>
                    {userName ? `${userName}'s History` : 'Deletion History'}
                </span>
            </div>
        </nav>
    );
}

// Quick navigation component for user management
export function UserManagementQuickNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Active Users',
            href: '/admin/users',
            icon: <Users className="h-4 w-4" />,
            isActive: pathname === '/admin/users',
        },
        {
            label: 'Deleted Users',
            href: '/admin/users/deleted',
            icon: <UserX className="h-4 w-4" />,
            isActive: pathname.startsWith('/admin/users/deleted'),
        },
    ];

    return (
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            {navItems.map(item => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        item.isActive
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50'
                    )}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </Link>
            ))}
        </div>
    );
}
