'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
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
import { inviteUserAction } from '@/server-actions/admin/admin-auth-actions';
import {
  InviteUserSchema,
  type ZInviteUserType,
} from '@/utils/db/drizzle-zod-schema/users';

export default function InviteUserForm() {
  const onSubmit: SubmitHandler<ZInviteUserType> = async (validInputs) => {
    const formData = new FormData();
    formData.append('email', validInputs.email);
    validInputs?.phone && formData.append('phone', validInputs?.phone);
    validInputs.full_name &&
      formData.append('full_name', validInputs.full_name);
    const { success, data, message } = await inviteUserAction(formData);
    if (success && data && message) {
      toast.success(message);
    }
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
    <Form {...form}>
      <form
        className="flex flex-col space-y-4 rounded-md border p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="font-semibold text-lg">Fill all the input fields.</h2>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter user email to invite"
                  required
                  type="email"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  id="full_name"
                  placeholder="Enter user full to invite"
                  required
                  {...field}
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
            <FormItem className="flex flex-col items-start">
              <FormLabel>Phone number</FormLabel>
              <FormControl className="w-full">
                <Input
                  {...field}
                  id="phone"
                  placeholder="Enter user phone to invite"
                  required
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {form.formState.isSubmitting ? (
            <span>Submitting...</span>
          ) : (
            <span>Send Invite</span>
          )}
        </Button>
      </form>
    </Form>
  );
}
