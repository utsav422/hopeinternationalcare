'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Logo } from '@/components/Layout/logo';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signInAction } from '@/lib/server-actions/admin/admin-auth-actions';

const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

import type { DOT, RoutePoint } from '@/lib/types/shared';

const DotMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    {
      start: { x: 100, y: 150, delay: 0 },
      end: { x: 200, y: 80, delay: 2 },
      color: '#14B8A6',
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

  const generateDots = useCallback((width: number, height: number) => {
    const dots: DOT[] = [];
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          (x < width * 0.25 &&
            x > width * 0.05 &&
            y < height * 0.4 &&
            y > height * 0.1) ||
          (x < width * 0.25 &&
            x > width * 0.15 &&
            y < height * 0.8 &&
            y > height * 0.4) ||
          (x < width * 0.45 &&
            x > width * 0.3 &&
            y < height * 0.35 &&
            y > height * 0.15) ||
          (x < width * 0.5 &&
            x > width * 0.35 &&
            y < height * 0.65 &&
            y > height * 0.35) ||
          (x < width * 0.7 &&
            x > width * 0.45 &&
            y < height * 0.5 &&
            y > height * 0.1) ||
          (x < width * 0.8 &&
            x > width * 0.65 &&
            y < height * 0.8 &&
            y > height * 0.6);

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.2,
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

    function drawDots() {
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius ?? 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20, 184, 166, ${dot.opacity ?? 0.5})`;
        ctx.fill();
      }
    }

    function drawRoutes() {
      if (!ctx) {
        return;
      }
      const currentTime = (Date.now() - startTime) / 1000;

      for (const route of routes) {
        const elapsed = currentTime - (route.start.delay ?? 0);
        if (elapsed <= 0) {
          return;
        }

        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);

        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#14B8A6';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 184, 166, 0.4)';
        ctx.fill();

        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      }
    }

    function animate() {
      drawDots();
      drawRoutes();

      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
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

const SignInCard = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.set('email', values.email);
      formData.set('password', values.password);
      const result = await signInAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error?.message
          : 'Failed to submit the form. Please try again.'
      );
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative hidden h-[600px] w-1/2 overflow-hidden border-gray-200 border-r md:block dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50">
            <DotMap />
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
                className="max-w-xs text-gray-600 text-sm dark:text-gray-400"
                initial={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Sign in to access your organization's web dashboard as an
                Administrator.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="relative flex w-full flex-col justify-center space-y-8 bg-white px-8 py-10 md:w-1/2 md:px-10 dark:bg-gray-800">
          <div className="flex w-full items-center justify-center">
            <Logo className="h-20" />
          </div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-8 text-center text-gray-500 dark:text-gray-400">
              Sign in as Super Admin
            </p>
            <Form {...form}>
              <form
                className="mx-auto max-w-sm space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-200">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full border-gray-300 bg-gray-100 text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500"
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
                      <FormLabel className="dark:text-gray-200">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            className="w-full border-gray-300 bg-gray-100 pr-10 text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500"
                            placeholder="Enter your password"
                            required
                            type={isPasswordVisible ? 'text' : 'password'}
                          />
                          <button
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                      'relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 py-3 text-white transition-all duration-300 hover:from-teal-600 hover:to-indigo-700',
                      isHovered
                        ? 'shadow-blue-300 shadow-lg dark:shadow-blue-800'
                        : ''
                    )}
                    type="submit"
                  >
                    <span className="flex items-center justify-center">
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                    {isHovered && (
                      <motion.span
                        animate={{ left: '100%' }}
                        className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
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
  );
};

export default SignInCard;
