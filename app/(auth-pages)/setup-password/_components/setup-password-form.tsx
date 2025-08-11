'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { setupPasswordAction } from '@/server-actions/user/user-auth-actions';

export default function SetupPasswordComponent() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const searchParams = useSearchParams();
  const setupPasswordError = searchParams.get('error');
  const formSchema = z
    .object({
      password: z.string().min(6, 'Password must be at least 6 characters.'),
      confirmPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.set('password', values.password);
    formData.set('confirmPassword', values.confirmPassword);
    await setupPasswordAction(formData);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 sm:p-8 md:p-10 dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="font-bold text-2xl dark:text-white">
            Password Setup
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Create a new password for your account.
          </CardDescription>
        </CardHeader>
        {setupPasswordError && (
          <p className="mt-4 text-center text-red-500">
            * {setupPasswordError}
          </p>
        )}
        <Form {...form}>
          <form
            className="mt-6 space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                          placeholder="Enter new password"
                          required
                          type={isPasswordVisible ? 'text' : 'password'}
                        />
                        <Button
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="Confirm your new password"
                        required
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {form.formState.isSubmitting
                  ? 'Setting Up Password...'
                  : 'Set Password'}
              </Button>
              <p className="text-center text-gray-600 text-sm dark:text-gray-400">
                Remember your password?{' '}
                <Link
                  className="font-medium text-teal-600 hover:underline dark:text-teal-500"
                  href="/sign-in"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
