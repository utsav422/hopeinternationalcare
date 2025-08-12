'use client';
import { IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense, useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuthSession } from '@/hooks/use-auth-session';
import { signOutAction } from '@/lib/server-actions/user/user-auth-actions';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '../theme-switcher';
import { UserAppSidebar } from '../User/Sidebar/app-sidebar';
import { Button } from '../ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '../ui/navigation-menu';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { NavigationSheet } from './navigation-sheet';
import { SiteHeader } from './site-header';

const LINKS = [
  {
    title: 'Company',
    items: [
      { label: 'About Us', href: '/aboutus' },
      { label: 'Our Courses', href: 'courses' },
      { label: 'Contact Us', href: 'contactus' },
    ],
  },
];

const CURRENT_YEAR = new Date().getFullYear();

export function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const [isScrolling, setIsScrolling] = useState(false);
  // Don't show header/footer for admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/user');
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

  // Handle user sidebar layout
  if (user && user.role === 'authenticated' && isUserRoute) {
    return <div className="my-16">{children}</div>;
  }
  if (isAdminRoute) {
    // Let the admin layout handle admin routes
    return <>{children}</>;
  }

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${pathname === '/' ? 'bg-transparent' : 'bg-white dark:bg-gray-950'} ${
          pathname.includes('/') && isScrolling
            ? 'bg-white shadow-md dark:bg-gray-950 dark:shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div
          className={cn(
            'mx-auto h-16 bg-transparent text-secondary dark:text-gray-300',
            isScrolling && pathname === '/' && 'text-primary dark:text-white'
          )}
        >
          <div className="flex h-full items-center px-4 text-xs md:px-4 md:text-base lg:px-8">
            <Logo />
            {/* Desktop Menu */}
            <NavMenu
              className="hidden md:mx-auto md:flex md:justify-between md:space-x-2 "
              isScrolling
            />
            <div className="hidden border-r md:inline dark:border-gray-700" />
            <NavigationMenu className="hidden lg:mx-auto lg:block">
              <NavigationMenuList
                className={cn(
                  'space-x-1 text-xs data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start md:text-base lg:space-x-2 xl:space-x-3',
                  pathname !== '/' && 'text-primary dark:text-white '
                )}
              >
                <NavigationMenuItem
                  className={cn(
                    'rounded-md p-1 hover:bg-teal-500/10',
                    !isScrolling && pathname === '/' && 'hover:bg-teal-500/10'
                  )}
                >
                  <NavigationMenuLink asChild>
                    <IconBrandInstagram className="size-5" />
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem
                  className={cn(
                    'rounded-md p-1 hover:bg-teal-500/10',
                    !isScrolling && pathname === '/' && 'hover:bg-teal-500/10'
                  )}
                >
                  <NavigationMenuLink asChild>
                    <IconBrandFacebook className="size-5" />
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem
                  className={cn(
                    'rounded-md p-1 hover:bg-teal-500/10',
                    !isScrolling && pathname === '/' && 'hover:bg-teal-500/10'
                  )}
                >
                  <NavigationMenuLink asChild>
                    <IconBrandInstagram className="size-5" />
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div className="hidden border-r md:inline dark:border-gray-700" />

            <div className="hidden md:flex md:items-center md:gap-3">
              <Suspense fallback={<LoaderIcon />}>
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="hidden text-xs md:text-base lg:inline dark:text-gray-300">
                      Hey, {user.email}!
                    </span>
                    <Button
                      asChild
                      className="bg-teal-500 hover:bg-teal-600 "
                      size="sm"
                    >
                      <Link
                        href={
                          user?.role === 'service_role' ? '/admin' : '/profile'
                        }
                      >
                        {user?.role === 'service_role'
                          ? 'Dashboard'
                          : 'Profile'}
                      </Link>
                    </Button>
                    <form
                      action={async () => {
                        await signOutAction();
                      }}
                    >
                      <Button
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/95 hover:text-white"
                        type="submit"
                        variant={'ghost'}
                      >
                        Sign out
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant={'ghost'}>
                      <Link
                        className={cn(
                          pathname !== '/' && 'text-teal-500 dark:text-teal-400'
                        )}
                        href="/sign-in"
                      >
                        Sign in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-teal-500 hover:bg-teal-600 "
                      size="sm"
                    >
                      <Link href="/sign-up">Sign up</Link>
                    </Button>
                  </div>
                )}
              </Suspense>
            </div>
            <div
              className={cn(
                'ml-auto inline md:hidden',
                pathname === '/' && isScrolling
                  ? ''
                  : 'bg-transparent text-black dark:text-white'
              )}
            >
              <NavigationSheet isScrolling={isScrolling} />
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-col dark:bg-gray-900 dark:text-gray-100">
        {user &&
          user.role === 'authenticated' &&
          pathname.includes('/user') && (
            <div>
              <SidebarProvider className="my-16">
                <UserAppSidebar className="my-16" variant="inset" />
                <SidebarInset>
                  <SiteHeader />
                  <main className="mx-3 my-3 flex flex-1 flex-col">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </div>
          )}
        {!pathname.includes('/user') && children}
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  const pathname = usePathname();
  const blackListLink = [
    '/reset-password',
    '/forgot-password',
    '/setup-password',
  ];
  if (blackListLink.includes(pathname)) {
    return null;
  }

  return (
    <footer className="px-8 pt-16 pb-8 dark:bg-gray-900">
      <div className="container mx-auto flex max-w-6xl flex-col">
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center">
              <Logo className="h-10 w-auto" />
            </div>
            <h6 className="mb-4 font-bold text-gray-800 text-lg dark:text-gray-100">
              Hope International Aged Care Training and Elderly Care Center
            </h6>

            <p className="mb-4 text-base text-gray-800 dark:text-gray-300">
              At Hope International, we are driven by a passion for enhancing
              the quality of life for elderly individuals and empowering
              caregivers to make a meaningful difference in their lives. Join us
              in our journey towards creating a future where every senior
              receives the respect, dignity, and care they deserve.Trust us with
              your passion, and let us work together to achieve the best
              possible outcomes for you and your goal.
            </p>
          </div>

          <div className="mb-10 md:mb-0">
            {LINKS.map(({ title, items }, _: number) => (
              <ul key={title}>
                <h6 className="mb-2 text-gray-800 text-lg dark:text-gray-100">{title}</h6>
                {items.map(({ label, href }, __: number) => (
                  <li key={href}>
                    <a
                      className="block py-1 text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                      href={href}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          <div>
            <h6 className="mb-4 font-bold text-gray-800 text-lg dark:text-gray-100">
              Our Location
            </h6>
            <div className="h-64 w-full overflow-hidden rounded-md md:h-80">
              <iframe
                allowFullScreen
                className="h-full w-full"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56522.59211451086!2d85.26497023124999!3d27.696839499999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198d32e428a9%3A0x3f168c6bdffc0c64!2sHope%20International%20Aged%20Care%20Training%20and%20Elderly%20Care%20Center!5e0!3m2!1sen!2snp!4v1715100246835!5m2!1sen!2snp"
                style={{ border: 0 }}
                title="Hope International Aged Care Training and Elderly Care Center Location"
                width="100%"
              />
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
          <p className="text-gray-700 md:text-center dark:text-gray-300">
            &copy; {CURRENT_YEAR} Hope International Aged Care Training And
            Elderly Care Center.
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}

export default Layout;
