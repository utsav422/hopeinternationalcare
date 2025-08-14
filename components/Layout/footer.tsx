'use client'

import Link from "next/link";
import { Logo } from "./logo";
import { ThemeSwitcher } from "../theme-switcher";

const LINKS = [
    {
        title: 'Company',
        items: [
            { label: 'About Us', href: '/aboutus' },
            { label: 'Our Courses', href: '/courses' },
            { label: 'Contact Us', href: '/contactus' },
        ],
    }
]
const CURRENT_YEAR = new Date().getFullYear();
export function Footer() {
    return (
        <footer className="px-4 pt-16 pb-8 dark:bg-gray-900 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
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
                            receives the respect, dignity, and care they deserve. Trust us with
                            your passion, and let us work together to achieve the best
                            possible outcomes for you and your goal.
                        </p>
                    </div>

                    <div className="mb-10 md:mb-0">
                        {LINKS.map(({ title, items }) => (
                            <ul key={title}>
                                <h6 className="mb-2 text-gray-800 text-lg dark:text-gray-100">
                                    {title}
                                </h6>
                                {items.map(({ label, href }) => (
                                    <li key={href}>
                                        <Link
                                            className="block py-1 text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                                            href={href}
                                        >
                                            {label}
                                        </Link>
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
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56522.59211451086!2d85.26497023124999!3d27.696839499999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198d32e428a9%3A0x3f168c6bdffc0c64!2sHope%20International%20Aged%20Care%20Training%20and%20Elderly%20Care%20Center!5e0!3m2!1sen!2snp!4v1715100246835!5m2!1sen!2snp"
                                title="Hope International Aged Care Training and Elderly Care Center Location"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
                    <p className="text-gray-700 dark:text-gray-300">
                        &copy; {CURRENT_YEAR} Hope International Aged Care Training And
                        Elderly Care Center.
                    </p>
                    <ThemeSwitcher />
                </div>
            </div>
        </footer>
    );
}
