'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InviteUserSchema,
  type ZInviteUserType,
} from '@/lib/db/drizzle-zod-schema/users';
import { inviteUserAction } from '@/lib/server-actions/admin/admin-auth-actions';

export default function InviteUserForm() {
  const onSubmit: SubmitHandler<ZInviteUserType> = async (validInputs) => {
    const formData = new FormData();
    formData.append('email', validInputs.email);
    validInputs?.phone && formData.append('phone', validInputs?.phone);
    validInputs.full_name &&
      formData.append('full_name', validInputs.full_name);
    await toast.promise(inviteUserAction(formData), {
      loading: 'Sending invite...',
      success: (result) => {
        if (result.success && result.message) {
          return result.message;
        }
        if (result.message) {
          throw new Error(result.message);
        }
        throw new Error('Failed to send invite');
      },
      error: (error) => {
        return error.message || 'Failed to send invite';
      },
    });
  };
  const form = useForm<ZInviteUserType>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: {
      email: '',
      phone: undefined,
      full_name: undefined,
    },
  });
  const handleSubmit = form.handleSubmit;

  return (
    <Card className="dark:border-gray-600 dark:bg-gray-800">
      <CardHeader>
        <div className="mb-6 space-y-1">
          <CardTitle className="font-medium text-lg dark:text-white">
            Invite Form
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Fill in the information below.
          </CardDescription>
        </div>
        <hr className="dark:border-gray-600" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="font-medium text-sm leading-none dark:text-white">
                      Email
                    </FormLabel>
                  </div>{' '}
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        placeholder="Enter user email to invite"
                        required
                        type="email"
                        {...field}
                        className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </FormControl>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="font-medium text-sm leading-none dark:text-white">
                      Full name
                    </FormLabel>
                  </div>{' '}
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        id="full_name"
                        placeholder="Enter user full to invite"
                        required
                        {...field}
                        className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </FormControl>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="font-medium text-sm leading-none dark:text-white">
                      Phone number
                    </FormLabel>
                  </div>{' '}
                  <div className="space-y-2 md:col-span-3">
                    <FormControl className="w-full">
                      <Input
                        {...field}
                        className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        id="phone"
                        placeholder="Enter user phone to invite"
                        required
                      />
                    </FormControl>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
              <div className="space-y-1 md:col-span-1">
                <FormLabel className="font-medium text-sm leading-none dark:text-white">
                  Action{' '}
                </FormLabel>{' '}
                <FormDescription className="text-muted-foreground text-xs dark:text-gray-400">
                  Submit Action Button For Invitation
                </FormDescription>
              </div>
              <div className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                <Button
                  className="dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700"
                  disabled={form.formState.isSubmitting}
                  type="submit"
                >
                  {form.formState.isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <span>Send Invite</span>
                  )}
                </Button>{' '}
              </div>
            </FormItem>
          </form>
        </Form>{' '}
      </CardContent>
    </Card>
  );
}
