'use client'
import { Logo } from '@/components/Layout/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';
import { ChevronLeft, ChevronRight, Menu, LogOut, User, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useAuthSession } from '@/hooks/use-auth-session';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/utils/supabase/client';

function BackgroungImageCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselImages = ['/image/bg1.jpg', '/image/bg2.jpg'];
    const { user, loading } = useAuthSession();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Redirect to home page after logout
        window.location.href = '/';
    };
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) =>
                prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handlePrevClick = () => {
        setCurrentSlide((prevSlide) =>
            prevSlide === 0 ? carouselImages.length - 1 : prevSlide - 1
        );
    };

    const handleNextClick = () => {
        setCurrentSlide((prevSlide) =>
            prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1
        );
    };
    return (
        <>  {/* Background Image */}
            <div className="absolute inset-0">
                {/* Background Image Carousel */}
                <div className="absolute inset-0 h-full w-full">
                    {carouselImages.map((src, index) => (
                        <Image unoptimized={true}
                            alt={`Background image ${index + 1}`}
                            className={`transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                            key={src}
                            fill
                            objectFit="cover"
                            priority={index === 0}
                            quality={85}
                            src={src}
                        />
                    ))}
                </div>
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40" />
            </div>
            {/* Navigation Bar */}
            <nav className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
                {/* Logo */}
                <Logo />

                {/* Desktop Navigation Menu */}
                <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-white">
                    <Link href="/" className="hover:text-teal-400 transition-colors text-sm lg:text-base">
                        Home
                    </Link>
                    <Link href="/aboutus" className="hover:text-teal-400 transition-colors text-sm lg:text-base">
                        About Us
                    </Link>
                    <Link href="/courses" className="hover:text-teal-400 transition-colors text-sm lg:text-base">
                        Our Courses
                    </Link>
                    <Link href="/contactus" className="hover:text-teal-400 transition-colors text-sm lg:text-base">
                        Contact Us
                    </Link>
                </div>

                {/* Right Side - Social Icons and Auth Buttons */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Social Icons - Hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                        <Link href="#" className="text-white hover:text-teal-400 transition-colors">
                            <IconBrandInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <Link href="#" className="text-white hover:text-teal-400 transition-colors">
                            <IconBrandFacebook className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <Link href="#" className="text-white hover:text-teal-400 transition-colors">
                            <IconBrandInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                    </div>

                    {/* Auth Buttons - Hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-2">
                        {loading ? (
                            // Loading state with skeleton UI
                            <>
                                <Skeleton className="h-8 w-16 bg-white/20" />
                                <Skeleton className="h-8 w-20 bg-white/20" />
                            </>
                        ) : user ? (
                            // Authenticated user - show dashboard and logout buttons
                            <>
                                <Link href={user.role === 'service_role' ? '/admin' : '/users'}>
                                    <Button variant="ghost" className="text-white hover:text-teal-400 hover:bg-white/10 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm">
                                        <LayoutDashboard className="w-4 h-4 mr-1 sm:mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="ghost"
                                    className="text-white hover:text-teal-400 hover:bg-white/10 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm"
                                >
                                    <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            // Unauthenticated user - show sign in and sign up buttons
                            <>
                                <Link href="/sign-in">
                                    <Button variant="ghost" className="text-white hover:text-teal-400 hover:bg-white/10 px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/sign-up">
                                    <Button className="bg-teal-400 hover:bg-teal-500 text-white px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm">
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-white hover:text-teal-400 hover:bg-white/10"
                            >
                                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[280px] sm:w-[300px] bg-white/95 backdrop-blur-md">
                            <div className="flex flex-col space-y-6 mt-8">
                                {/* Navigation Links */}
                                <div className="flex flex-col space-y-4">
                                    <Link
                                        href="/"
                                        className="text-gray-800 hover:text-teal-600 transition-colors text-base sm:text-lg font-medium py-2"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="text-gray-800 hover:text-teal-600 transition-colors text-base sm:text-lg font-medium py-2"
                                    >
                                        About Us
                                    </Link>
                                    <Link
                                        href="/courses"
                                        className="text-gray-800 hover:text-teal-600 transition-colors text-base sm:text-lg font-medium py-2"
                                    >
                                        Our Courses
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="text-gray-800 hover:text-teal-600 transition-colors text-base sm:text-lg font-medium py-2"
                                    >
                                        Contact Us
                                    </Link>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200" />

                                {/* Auth Buttons */}
                                <div className="flex flex-col space-y-3">
                                    {loading ? (
                                        // Loading state with skeleton UI
                                        <>
                                            <Skeleton className="h-10 w-full bg-gray-200" />
                                            <Skeleton className="h-10 w-full bg-gray-200" />
                                        </>
                                    ) : user ? (
                                        // Authenticated user - show dashboard and logout buttons
                                        <>
                                            <Link href={user.role === 'service_role' ? '/admin' : '/profile'}>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-gray-300 text-gray-800 hover:bg-gray-50 bg-transparent"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                                    Dashboard
                                                </Button>
                                            </Link>
                                            <Button
                                                onClick={handleLogout}
                                                className="w-full bg-teal-400 hover:bg-teal-500 text-white"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        // Unauthenticated user - show sign in and sign up buttons
                                        <>
                                            <Link href="/sign-in">
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-gray-300 text-gray-800 hover:bg-gray-50 bg-transparent"
                                                >
                                                    Sign In
                                                </Button>
                                            </Link>
                                            <Link href="/sign-up">
                                                <Button className="w-full bg-teal-400 hover:bg-teal-500 text-white">Sign up</Button>
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Social Icons */}
                                <div className="flex items-center justify-center space-x-6 pt-4">
                                    <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                                        <IconBrandInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                                        <IconBrandFacebook className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors">
                                        <IconBrandInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
            {/* Navigation Buttons */}
            <button
                aria-label="Previous Slide"
                className="-translate-y-1/2 absolute top-1/2 left-3 z-20 transform rounded-full bg-white/20 p-1.5 text-white transition-all duration-300 hover:scale-110 hover:bg-white/40 focus:outline-none focus:ring-4 focus:ring-white/50 sm:left-4 sm:p-2 md:left-6 md:p-2.5"
                onClick={handlePrevClick}
                type="button"
            >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            </button>
            <button
                aria-label="Next Slide"
                className="-translate-y-1/2 absolute top-1/2 right-3 z-20 transform rounded-full bg-white/20 p-1.5 text-white transition-all duration-300 hover:scale-110 hover:bg-white/40 focus:outline-none focus:ring-4 focus:ring-white/50 sm:right-4 sm:p-2 md:right-6 md:p-2.5"
                onClick={handleNextClick}
                type="button"
            >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            </button>
        </>
    )
}

export default BackgroungImageCarousel