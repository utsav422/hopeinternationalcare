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
  CardAction,
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
import { forgotPasswordAction } from '@/server-actions/user/user-auth-actions';
export default function ForgotPasswordComponent() {
  const searchParams = useSearchParams();
  const forgotPasswordError = searchParams.get('error');
  const formSchema = z.object({
    email: z.string().email({
      message: 'Username must be at least 2 characters.',
    }),
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
    <Card className="m-auto my-20 flex min-w-72 max-w-sm flex-1 flex-col gap-2 text-foreground lg:my-52 [&>input]:mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Forgot Password Form</CardTitle>
        <CardDescription>
          Enter your email associate to this system
        </CardDescription>
        <CardAction>
          Remember your password? &nbsp;
          <Link className="text-primary underline" href="/sign-in">
            Sign in
          </Link>
        </CardAction>
      </CardHeader>
      {forgotPasswordError && forgotPasswordError?.length > 0 && (
        <p className="ps-5 text-destructive">* {forgotPasswordError}</p>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="you@example.com" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader size={2} />}
              {form.formState.isSubmitting ? 'Submitting' : 'Reset Password'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
