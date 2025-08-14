'use client';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthSession } from '@/hooks/use-auth-session';
import { signOutAction } from '@/lib/server-actions/user/user-auth-actions';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '../theme-switcher';
import { UserAppSidebar } from '../User/Sidebar/app-sidebar';
import { Button } from '../ui/button';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { NavigationSheet } from './navigation-sheet';
import { SiteHeader } from './site-header';
import { Footer } from './footer';



export function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuthSession();

    // Check if we're on the home page
    const isHomePage = pathname === '/';

    // Route checks
    const isAdminRoute = pathname.startsWith('/admin');
    const isUserRoute = pathname.startsWith('/user');
    const isAuthRoute = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/setup-password'].includes(pathname);

    // Handle special route layouts
    if (isAdminRoute) {
        return <>{children}</>;
    }

    if (user && user.role === 'authenticated' && isUserRoute) {
        return (
            <SidebarProvider className="my-16">
                <UserAppSidebar className="my-16" variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <main className="mx-3 my-3 flex flex-1 flex-col">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }
    if (isHomePage) {
        return <>
            <div className="min-h-screen relative">{children}</div>
            <Footer />
        </>
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
                            <Suspense fallback={<LoaderIcon className="h-5 w-5" />}>
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <span className="hidden text-sm lg:inline">
                                            Hey, {user.email}!
                                        </span>
                                        <Button asChild size="sm">
                                            <Link href={user?.role === 'service_role' ? '/admin' : '/profile'}>
                                                {user?.role === 'service_role' ? 'Dashboard' : 'Profile'}
                                            </Link>
                                        </Button>
                                        <form onSubmit={signOutAction}>
                                            <Button
                                                type="submit"
                                                variant="ghost"
                                                size="sm"
                                            >
                                                Sign out
                                            </Button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button asChild size="sm" variant="ghost" >
                                            <Link href="/sign-in">
                                                Sign in
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="sm"
                                        >
                                            <Link href="/sign-up">Sign up</Link>
                                        </Button>
                                    </div>
                                )}
                            </Suspense>
                        </div>

                        {/* Mobile Menu */}
                        <div className="ml-auto md:hidden">
                            <NavigationSheet
                                isHomePage={isHomePage}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-col">
                {children}
            </main>

            {!isAuthRoute && <Footer />}
        </>
    );
}


export default Layout;
