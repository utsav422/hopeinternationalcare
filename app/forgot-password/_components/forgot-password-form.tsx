'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { forgotPasswordAction } from '@/lib/server-actions/user/user-auth-actions';

export default function ForgotPasswordComponent() {
    const searchParams = useSearchParams();
    const forgotPasswordError = searchParams.get('error');
    const formSchema = z.object({
        email: z.string().email('Please enter a valid email address.'),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.set('email', values.email);
        formData.set('callBaclUrl', '/forgot-password/success');
        await forgotPasswordAction(formData);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md p-6 sm:p-8 md:p-10 dark:bg-gray-800">
                <CardHeader className="text-center">
                    <CardTitle className="font-bold text-2xl ">
                        Forgot Password
                    </CardTitle>
                    <CardDescription className="">
                        Enter your email to receive a password reset link.
                    </CardDescription>
                </CardHeader>
                {forgotPasswordError && (
                    <p className="mt-4 text-center text-red-500">
                        * {forgotPasswordError}
                    </p>
                )}
                <Form {...form}>
                    <form
                        className="mt-6 space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="dark:border-gray-600 dark:bg-gray-700 "
                                                placeholder="you@example.com"
                                                required
                                                type="email"
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
                                {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
