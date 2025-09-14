'use client';
import { useRouter } from 'next/navigation';
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
import { setupPasswordAction } from '@/lib/server-actions/user/user-auth-actions';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export default function SetupPasswordComponent() {
    const router = useRouter();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Extract auth params from URL state once on render (no useState)
    // Note: Supabase returns auth values in the URL hash (after #),
    // while our app passes full_name and phone via query/search params.
    const searchParams = useSearchParams();
    const fragmentParams = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.hash.replace(/^#/, ''))
        : new URLSearchParams('');

    const oauthParams = {
        // From hash fragment
        access_token: fragmentParams.get('access_token'),
        refresh_token: fragmentParams.get('refresh_token'),
        expires_at: fragmentParams.get('expires_at'),
        expires_in: fragmentParams.get('expires_in'),
        token_type: fragmentParams.get('token_type'),
        type: fragmentParams.get('type'),
        // From search/query string
        full_name: searchParams.get('full_name'),
        phone: searchParams.get('phone'),
    } as const;
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
        // Include refresh token from URL params for server action
        if (oauthParams.refresh_token) {
            formData.set('refresh_token', oauthParams.refresh_token);
        }

        toast.promise(setupPasswordAction(formData), {
            loading: 'Setting up password ...',
            success: (result: { success: boolean; message: string, data?: { user: User } }) => {
                if (result?.success && result?.message && result?.data?.user) {
                    router.replace('/users/profile');
                    return result?.message
                }
                return result?.message??'Failed to setup password'
            },
            error: (error: Error) => {
                return error.message || 'Failed to setup password';
            },
        });
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md p-6 sm:p-8 md:p-10 dark:bg-gray-800">
                <CardHeader className="text-center">
                    <CardTitle className="font-bold text-2xl ">
                        Password Setup
                    </CardTitle>
                    <CardDescription className="">
                        Create a new password for your account.
                    </CardDescription>
                </CardHeader>
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
                                        <FormLabel className="">
                                            New Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    className="dark:border-gray-600 dark:bg-gray-700 "
                                                    placeholder="Enter new password"
                                                    required
                                                    type={isPasswordVisible ? 'text' : 'password'}
                                                />
                                                <Button
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700  dark:hover:text-gray-200"
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
                                        <FormLabel className="">
                                            Confirm New Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="dark:border-gray-600 dark:bg-gray-700 "
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
                            <p className="text-center text-gray-600 text-sm ">
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
