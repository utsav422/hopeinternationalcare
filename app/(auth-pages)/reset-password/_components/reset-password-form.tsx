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
import { resetPasswordAction } from '@/server-actions/user/user-auth-actions';
export default function ResetPasswordComponent() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const searchParams = useSearchParams();
  const ressetPasswordError = searchParams.get('error');
  const formSchema = z
    .object({
      password: z.string().min(6),
      confirmPassword: z.string().min(6),
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
    await resetPasswordAction(formData);
  }
  return (
    <Card className="m-auto my-20 flex min-w-64 max-w-sm flex-1 flex-col gap-2 text-foreground lg:my-52 [&>input]:mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Password Reset Form</CardTitle>
        <CardDescription>
          Enter your new password to change your account password
        </CardDescription>
        <CardAction>
          Remember your password? &nbsp;
          <Link className="text-primary underline" href="/sign-in">
            Sign in
          </Link>
        </CardAction>
      </CardHeader>
      {ressetPasswordError && ressetPasswordError?.length > 0 && (
        <p className="ps-5 text-destructive">* {ressetPasswordError}</p>
      )}
      <Form {...form}>
        <form className="" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className=" mt-8 flex flex-col gap-2 [&>input]:mb-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="New password"
                          required
                          type={isPasswordVisible ? 'text' : 'password'}
                        />
                        <Button
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                          type="button"
                          variant={'ghost'}
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
            </div>
            <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Re enter new passsword to confirm"
                        required
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
