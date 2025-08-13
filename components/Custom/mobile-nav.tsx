'use client';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

interface NavItemProps {
    href: string;
    label: string;
    target?: string;
}

function NavItem({ href, label }: NavItemProps) {
    return (
        <Link href={href}>
            <li className="transform font-bold transition duration-300 hover:scale-110">
                {label}
            </li>
        </Link>
    );
}
function MobileNav({ isScrolling }: { isScrolling: boolean }) {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen((cur) => !cur);

    React.useEffect(() => {
        window.addEventListener(
            'resize',
            () => window.innerWidth >= 960 && setOpen(false)
        );
    }, []);

    // React.useEffect(() => {
    //     function handleScroll() {
    //         if (window.scrollY > 0) {
    //             setIsScrolling(true);
    //         } else {
    //             setIsScrolling(false);
    //         }
    //     }

    //     window.addEventListener("scroll", handleScroll);
    //     return () => window.removeEventListener("scroll", handleScroll);
    // }, []);

    return (
        <>
            {' '}
            <Button
                className={`p-2 lg:hidden ${isScrolling ? 'text-teal-900 dark:text-teal-400' : 'text-white'}`}
                onClick={handleOpen}
            >
                {open ? (
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <title>open</title>
                        <path
                            d="M6 18L18 6M6 6l12 12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : (
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <title>close</title>
                        <path
                            d="M4 6h16M4 12h16M4 18h16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </Button>
            {/* Mobile menu */}
            {open && (
                <div className="mt-2 rounded-lg bg-white px-4 pt-2 pb-4 lg:hidden dark:bg-gray-800">
                    <ul className="flex flex-col gap-4 text-teal-900 ">
                        <NavItem href="/" label="Home" />
                        <NavItem href="/aboutus" label="About Us" />
                        <NavItem href="/courses" label="Our Courses" />
                        <NavItem href="/contactus" label="Contact Us" />
                    </ul>
                    <div className="mt-4 flex gap-4">
                        <Button className="rounded-md p-2 text-teal-900 hover:bg-gray-100 dark:text-teal-400 dark:hover:bg-gray-700">
                            <i className="fa-brands fa-twitter text-base" />
                        </Button>
                        <Button className="rounded-md p-2 text-teal-900 hover:bg-gray-100 dark:text-teal-400 dark:hover:bg-gray-700">
                            <i className="fa-brands fa-facebook text-base" />
                        </Button>
                        <Button className="rounded-md p-2 text-teal-900 hover:bg-gray-100 dark:text-teal-400 dark:hover:bg-gray-700">
                            <i className="fa-brands fa-instagram text-base" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

export default MobileNav;
