'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Logo } from '@/components/Layout/logo';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { signInAction } from '@/server-actions/user/user-auth-actions';

// Helper function to merge class names
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Custom Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

const Button = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantStyles = {
    default:
      'bg-primary bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = ({ className = '', ...props }: InputProps) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-gray-800 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};
type DOT = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};
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
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20, 184, 166, ${dot.opacity})`; // Blue dots for light theme
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
        const elapsed = currentTime - route.start.delay;
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

const Page = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formSchema = z.object({
    email: z.string().min(1),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.set('email', values.email);
      formData.set('password', values.password);
      await signInAction(formData);
      toast.success(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error?.message
          : 'Failed to submit the form. Please try again.'
      );
    }
  }
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100 p-4">
      <div className="flex h-full w-full items-center justify-center">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          {/* Left side - Map */}
          <div className="relative hidden h-[600px] w-1/2 overflow-hidden border-teal-100 border-r md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-100">
              <DotMap />

              {/* Logo and text overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 shadow-blue-200 shadow-lg">
                    <ArrowRight className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
                <h2 className="flex gap-2">
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 inline-block bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-center font-bold text-3xl text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    Hope
                  </motion.span>
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 inline-block bg-gradient-to-r from-blue-600 to-blue-500/80 bg-clip-text text-center font-bold text-3xl text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    International Care
                  </motion.span>
                </h2>
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xs text-center text-gray-600 text-sm"
                  initial={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  Sign in to access your profile
                </motion.p>
              </div>
            </div>
          </div>

          {/* Right side - Sign In Form */}
          <div className="relative flex w-full flex-col justify-center space-y-8 bg-white px-8 md:w-1/2 md:px-10">
            {/* <h1 className="text-2xl text-teal-500">Sign in</h1> */}
            <div className="my-3 flex items-center justify-center bg-transparent">
              <Logo className="aspect-auto h-23" />
            </div>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="w-full text-muted-foreground text-sm">
                Enter the valid login credentails.
              </p>
              <Form {...form}>
                <form
                  className="mx-auto max-w-3xl space-y-8"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter your email address"
                            required
                            type="email"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              className="w-full border-gray-200 bg-gray-50 pr-10 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter your password"
                              required
                              type={isPasswordVisible ? 'text' : 'password'}
                            />
                            <button
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                              onClick={() =>
                                setIsPasswordVisible(!isPasswordVisible)
                              }
                              type="button"
                            >
                              {isPasswordVisible ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
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
                        {form.formState.isSubmitting ? (
                          'Submitting...'
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
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
              </Form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
