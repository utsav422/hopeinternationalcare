'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { createCustomerContactRequest } from '@/lib/server-actions/user/customer-contact-requests';
import { CustomerContactFormSchema, type CustomerContactFormType } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';

export function ContactUsForm() {
    const form = useForm<CustomerContactFormType>({
        resolver: zodResolver(CustomerContactFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            message: '',
        },
    });

    async function onSubmit(data: CustomerContactFormType) {
        try {
            const formData = new FormData();
            formData.set('name', data.name);
            formData.set('message', data.message);
            formData.set('email', data.email);
            formData.set('phone', data.phone ?? '');

            const result = await createCustomerContactRequest(formData);

            if (result.success) {
                toast.success('Your message has been sent successfully!');
                form.reset();
            } else {
                const errorMessage = typeof result.error === 'string'
                    ? result.error
                    : 'Failed to send your message. Please try again later.';
                toast.error(errorMessage);
            }
        } catch (error: unknown) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to send your message. Please try again later.'
            );
        }
    }

    return (
        <section className="bg-gray-100 py-16 md:py-24 lg:py-32 dark:bg-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="font-extrabold text-3xl text-gray-900 sm:text-4xl md:text-5xl ">
                        Have Queries with us?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-600 text-xl ">
                        Send us a quick email so that we can get back to you as soon as
                        possible.
                    </p>
                </div>

                <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg md:p-10 dark:bg-gray-900">
                    <Form {...form}>
                        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 ">
                                            Full Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your Full Name"
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
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
                                        <FormLabel className="text-gray-800 ">
                                            Email Address
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="your@example.com"
                                                type="email"
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
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
                                        <FormLabel className="text-gray-800 ">
                                            Mobile Number (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="+977 9812344566"
                                                type="tel"
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 ">
                                            Message
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Type your message here..."
                                                rows={5}
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                className="w-full rounded-md bg-teal-500 px-8 py-3 font-semibold text-lg text-white shadow-md transition-colors duration-300 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700"
                                disabled={form.formState.isSubmitting}
                                type="submit"
                            >
                                {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </section>
    );
}
