'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Logo } from '@/components/Layout/logo';
import { Label } from '@/components/ui/label';
import { signUpAction } from '@/lib/server-actions/admin/admin-auth-actions';




import type { DOT, RoutePoint } from '@/lib/types/shared';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

const DotMap = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Set up routes that will animate across the map
    const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
        {
            start: { x: 100, y: 150, delay: 0 },
            end: { x: 200, y: 80, delay: 2 },
            color: '#14B8A6', //#14B8A6 // Slightly darker blue for better visibility on light bg
        },
        {
            start: { x: 200, y: 80, delay: 2 },
            end: { x: 260, y: 120, delay: 4 },
            color: '#14B8A6',
        },
        {
            start: { x: 50, y: 50, delay: 1 },
            end: { x: 150, y: 180, delay: 3 },
            color: '#14B8A6',
        },
        {
            start: { x: 280, y: 60, delay: 0.5 },
            end: { x: 180, y: 180, delay: 2.5 },
            color: '#14B8A6',
        },
    ];

    // Create dots for the world map
    const generateDots = useCallback((width: number, height: number) => {
        const dots: DOT[] = [];
        const gap = 12;
        const dotRadius = 1;

        // Create a dot grid pattern with random opacity
        for (let x = 0; x < width; x += gap) {
            for (let y = 0; y < height; y += gap) {
                // Shape the dots to form a world map silhouette
                const isInMapShape =
                    // North America
                    (x < width * 0.25 &&
                        x > width * 0.05 &&
                        y < height * 0.4 &&
                        y > height * 0.1) ||
                    // South America
                    (x < width * 0.25 &&
                        x > width * 0.15 &&
                        y < height * 0.8 &&
                        y > height * 0.4) ||
                    // Europe
                    (x < width * 0.45 &&
                        x > width * 0.3 &&
                        y < height * 0.35 &&
                        y > height * 0.15) ||
                    // Africa
                    (x < width * 0.5 &&
                        x > width * 0.35 &&
                        y < height * 0.65 &&
                        y > height * 0.35) ||
                    // Asia
                    (x < width * 0.7 &&
                        x > width * 0.45 &&
                        y < height * 0.5 &&
                        y > height * 0.1) ||
                    // Australia
                    (x < width * 0.8 &&
                        x > width * 0.65 &&
                        y < height * 0.8 &&
                        y > height * 0.6);

                if (isInMapShape && Math.random() > 0.3) {
                    dots.push({
                        x,
                        y,
                        radius: dotRadius,
                        opacity: Math.random() * 0.5 + 0.2, // Slightly higher opacity for light theme
                    });
                }
            }
        }
        return dots;
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
            canvas.width = width;
            canvas.height = height;
        });

        resizeObserver.observe(canvas.parentElement as Element);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!(dimensions.width && dimensions.height)) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const dots = generateDots(dimensions.width, dimensions.height);
        let animationFrameId: number;
        let startTime = Date.now();

        // Draw background dots
        function drawDots() {
            if (!ctx) {
                return;
            }
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            // Draw the dots
            for (const dot of dots) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius ?? 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(20, 184, 166, ${dot.opacity ?? 0.5})`; // Blue dots for light theme
                ctx.fill();
            }
        }

        // Draw animated routes
        function drawRoutes() {
            if (!ctx) {
                return;
            }
            const currentTime = (Date.now() - startTime) / 1000; // Time in seconds

            for (const route of routes) {
                const elapsed = currentTime - (route.start.delay ?? 0);
                if (elapsed <= 0) {
                    return;
                }

                const duration = 3; // Animation duration in seconds
                const progress = Math.min(elapsed / duration, 1);

                const x = route.start.x + (route.end.x - route.start.x) * progress;
                const y = route.start.y + (route.end.y - route.start.y) * progress;

                // Draw the route line
                ctx.beginPath();
                ctx.moveTo(route.start.x, route.start.y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = route.color;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Draw the start point
                ctx.beginPath();
                ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = route.color;
                ctx.fill();

                // Draw the moving point
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#14B8A6';
                ctx.fill();

                // Add glow effect to the moving point
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(20, 184, 166, 0.4)';
                ctx.fill();

                // If the route is complete, draw the end point
                if (progress === 1) {
                    ctx.beginPath();
                    ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = route.color;
                    ctx.fill();
                }
            }
        }

        // Animation loop
        function animate() {
            drawDots();
            drawRoutes();

            // If all routes are complete, restart the animation
            const currentTime = (Date.now() - startTime) / 1000;
            if (currentTime > 15) {
                // Reset after 15 seconds
                startTime = Date.now();
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions, generateDots]);

    return (
        <div className="relative h-full w-full overflow-hidden">
            <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
        </div>
    );
};

const formSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    email: z.email('Invalid email address'),
    full_name: z.string().min(1, 'Full name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
});
type SignupFormValues = z.infer<typeof formSchema>;

const SignUpCard = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            full_name: '',
            password: '',
            phone: '',
        },
    });
    const onSubmit = form.handleSubmit(async (data) => {
        const formData = new FormData();

        formData.set('full_name', data.full_name);
        formData.set('phone', data.phone);
        formData.set('email', data.email);
        formData.set('password', data.password);
        await signUpAction(formData);
    });
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
            <div className="flex h-full w-full items-center justify-center">
                <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800"
                    initial={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Left side - Map */}
                    <div className="relative order-2 hidden h-[667px] w-1/2 overflow-hidden border-gray-200 border-r md:block dark:border-gray-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50">
                            <DotMap />

                            {/* Logo and text overlay */}
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center">
                                <motion.div
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6"
                                    initial={{ opacity: 0, y: -20 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 shadow-blue-200 shadow-lg dark:shadow-blue-800">
                                        <ArrowRight className="h-6 w-6 text-white" />
                                    </div>
                                </motion.div>
                                <h2 className="flex gap-2">
                                    <motion.span
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-2 inline-block bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text font-bold text-3xl text-transparent dark:from-teal-400 dark:to-teal-300"
                                        initial={{ opacity: 0, y: -20 }}
                                        transition={{ delay: 0.7, duration: 0.5 }}
                                    >
                                        Hope
                                    </motion.span>
                                    <motion.span
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-2 inline-block bg-gradient-to-r from-blue-600 to-blue-500/80 bg-clip-text font-bold text-3xl text-transparent dark:from-blue-400 dark:to-blue-300/80"
                                        initial={{ opacity: 0, y: -20 }}
                                        transition={{ delay: 0.7, duration: 0.5 }}
                                    >
                                        International Care
                                    </motion.span>
                                </h2>
                                <motion.p
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-muted-foreground text-base"
                                    initial={{ opacity: 0, y: -20 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                >
                                    Sign in to access your organization web dashboard as
                                    Adminstrator
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Sign In Form */}
                    <div className="relative order-1 flex w-full flex-col justify-center space-y-8 bg-white px-8 py-10 md:w-1/2 md:p-10 dark:bg-gray-800">
                        <div className="flex items-center justify-center">
                            <Logo className="h-14" />
                        </div>
                        <Form {...form}>
                            <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                className=""
                                initial={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="py-2 text-gray-600 text-sm ">Sign in as Super Admin Account</p>

                                <form className="space-y-8" onSubmit={onSubmit}>
                                    <FormField
                                        control={form.control}
                                        name="full_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="">
                                                    Full Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="dark:border-gray-600 dark:bg-gray-700  dark:placeholder:text-gray-500"
                                                        placeholder="Enter your full name"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="">
                                                    Phone
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="dark:border-gray-600 dark:bg-gray-700  dark:placeholder:text-gray-500"
                                                        placeholder="Enter your phone number"
                                                        type="tel"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="">
                                                    Super Admin Email <span className="text-teal-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="dark:border-gray-600 dark:bg-gray-700  dark:placeholder:text-gray-500"
                                                        placeholder="Enter your email address"
                                                        required
                                                        type="email"
                                                    />
                                                </FormControl>
                                                <FormDescription className="dark:text-gray-500">
                                                    We'll never share your email.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="">
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            className="pr-10 dark:border-gray-600 dark:bg-gray-700  dark:placeholder:text-gray-500"
                                                            placeholder="Enter your password"
                                                            required
                                                            type={isPasswordVisible ? 'text' : 'password'}
                                                        />
                                                        <Button
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:bg-transparent hover:text-gray-700  dark:hover:text-gray-200"
                                                            onClick={() =>
                                                                setIsPasswordVisible(!isPasswordVisible)
                                                            }
                                                            type="button"
                                                            variant="ghost"
                                                        >
                                                            {isPasswordVisible ? (
                                                                <EyeOff size={18} />
                                                            ) : (
                                                                <Eye size={18} />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <motion.div
                                        className="pt-2"
                                        onHoverEnd={() => setIsHovered(false)}
                                        onHoverStart={() => setIsHovered(true)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            className={cn(
                                                'relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-2 text-white transition-all duration-300 hover:from-teal-600 hover:to-indigo-700',
                                                isHovered ? 'shadow-blue-200 shadow-lg' : ''
                                            )}

                                            type="submit"
                                        >
                                            <span className="flex items-center justify-center">
                                                Sign up
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </span>
                                            {isHovered && (
                                                <motion.span
                                                    animate={{ left: '100%' }}
                                                    className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                    initial={{ left: '-100%' }}
                                                    style={{ filter: 'blur(8px)' }}
                                                    transition={{ duration: 1, ease: 'easeInOut' }}
                                                />
                                            )}
                                        </Button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </Form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignUpCard;
