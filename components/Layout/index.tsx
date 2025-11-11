'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { type ReactNode } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { NavigationSheet } from './navigation-sheet';
import { Footer } from './footer';
import { Skeleton } from '@/components/ui/skeleton';

export function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, loading } = useAuthSession();

    // Check if we're on the home page
    const isHomePage = pathname === '/';

    // Route checks
    const isAdminRoute = pathname.startsWith('/admin');
    const isUserRoute = pathname.startsWith('/user');
    const isAuthRoute = [
        '/sign-in',
        '/sign-up',
        '/forgot-password',
        '/reset-password',
        '/setup-password',
    ].includes(pathname);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <div className="w-full max-w-4xl animate-pulse space-y-4 p-4">
                    <div className="h-8 w-3/4 rounded bg-gray-200"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-gray-200"></div>
                        <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                        <div className="h-4 w-4/6 rounded bg-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                className="h-48 rounded bg-gray-200"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    // Handle special route layouts
    if (isAdminRoute) {
        return <>{children}</>;
    }

    if (user && user.role === 'authenticated' && isUserRoute) {
        return <>{children}</>;
    }
    if (isHomePage) {
        return (
            <>
                <div className="min-h-screen relative">{children}</div>
                <Footer />
            </>
        );
    }
    return (
        <>
            <header
                className={cn(
                    'sticky top-0 z-50 w-full bg-background shadow-sm'
                )}
            >
                <div className="mx-auto h-16">
                    <div className="flex h-full items-center px-4 md:px-6 lg:px-8">
                        <Logo />

                        {/* Desktop Menu */}
                        <NavMenu
                            className="hidden md:mx-auto md:flex"
                            isHomePage={isHomePage}
                        />

                        {/* Auth Section */}
                        <div className="hidden md:flex md:items-center md:gap-3">
                            {loading ? (
                                // Loading state with skeleton UI
                                <>
                                    <Skeleton className="h-8 w-16 bg-white/20" />
                                    <Skeleton className="h-8 w-20 bg-white/20" />
                                </>
                            ) : user && user.role === 'authenticated' ? (
                                <div className="flex items-center gap-3">
                                    <span className="hidden text-sm lg:inline">
                                        Hey, {user.email}!
                                    </span>
                                    {/* <Button asChild size="sm"> */}
                                    {/*<>*/}
                                    {/*    /!*{user?.role}*!/*/}
                                    {/*    <Link*/}
                                    {/*        href={user?.role === 'service_role' ? '/admin' : '/users/profile'}>*/}
                                    {/*        {user?.role === 'service_role' ? 'Dashboard' : 'Profile'}*/}
                                    {/*    </Link>*/}
                                    {/*</>*/}
                                    {/* </Button> */}
                                    {/*<Button*/}
                                    {/*    onClick={signOutAction}*/}
                                    {/*    type="submit"*/}
                                    {/*    variant="ghost"*/}
                                    {/*    size="sm"*/}
                                    {/*>*/}
                                    {/*    Sign out*/}
                                    {/*</Button>*/}
                                </div>
                            ) : user && user.role === 'service_role' ? (
                                <div className="flex gap-2">
                                    <Button asChild size="sm" variant="ghost">
                                        <Link href="/sign-in">Admin Login</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href="/sign-up">Sign up</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button asChild size="sm" variant="ghost">
                                        <Link href="/sign-in">Login</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href="/sign-up">Sign up</Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <div className="ml-auto md:hidden">
                            <NavigationSheet isHomePage={isHomePage} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-col">{children}</main>

            {!isAuthRoute && <Footer />}
        </>
    );
}

export default Layout;
