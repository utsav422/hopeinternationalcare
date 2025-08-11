'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { sendEmail } from '@/utils/send-email';

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must not exceed 50 characters.'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits.')
    .max(15, 'Phone number must not exceed 15 digits.')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address.'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters.')
    .max(500, 'Message must not exceed 500 characters.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactUsForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(data: ContactFormValues) {
    try {
      await sendEmail(data);
      toast.success('Your message has been sent successfully!');
      form.reset();
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
          <h2 className="font-extrabold text-3xl text-gray-900 sm:text-4xl md:text-5xl dark:text-white">
            Have Queries with us?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600 text-xl dark:text-gray-400">
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Full Name"
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@example.com"
                        type="email"
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Mobile Number (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+977 9812344566"
                        type="tel"
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        rows={5}
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
