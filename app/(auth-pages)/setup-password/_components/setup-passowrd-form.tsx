'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Logo } from '@/components/Layout/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { setupPassword } from '@/server-actions/user/user-auth-actions';

export default function SetupPasswordForm() {
  const [_isLoading] = useTransition();
  const searchParams = useSearchParams();
  const full_name = searchParams.get('full_name');
  const phone = searchParams.get('phone');
  const router = useRouter();

  const [refreshToken, setRefreshToken] = useState<null | string>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1);

    const params = new URLSearchParams(hash);
    const refreshToken = params.get('refresh_token');

    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
  }, []);

  const formSchema = z
    .object({
      password: z.string().min(6, 'Password must be at least 6 characters.'),
      confirmPassword: z.string(),
      full_name: z.string(),
      phone: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    });

  type SetupPasswordFormValues = z.infer<typeof formSchema>;

  const form = useForm<SetupPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      full_name: full_name ?? '',
      phone: phone ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (!refreshToken || refreshToken.length === 0) {
      toast.error('Refresh token is missing.');
      return;
    }

    const setupFormData = new FormData();
    setupFormData.set('password', data.password);
    setupFormData.set('refresh_token', refreshToken);

    const { success, message } = await setupPassword(setupFormData);
    if (success) {
      toast.info(message);
      router.push('/profile');
    } else {
      toast.error(message);
    }
  });

  return (
    <Card className="m-auto my-20 flex min-w-64 max-w-sm flex-1 flex-col gap-2 text-foreground lg:my-52 [&>input]:mb-6">
      <CardHeader>
        <div className="mx-auto mb-5 bg-transparent">
          <Logo className="aspect-auto h-23" />
        </div>
        <CardTitle className="text-center font-bold text-2xl">
          Setup Password
        </CardTitle>
      </CardHeader>
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100 p-4">
        <Form {...form}>
          <form className="space-y-6" onSubmit={onSubmit}>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                Please enter your all input field marked{' '}
                <span className="text-teal-500">*</span>.
              </p>

              <div>
                <Label
                  aria-required="true"
                  className="mb-1 block font-medium text-gray-700 text-sm"
                  htmlFor="full_name"
                >
                  Full Name <span className="text-teal-500">*</span>
                </Label>
                <Input
                  {...form.register('full_name', {
                    required: 'This field is required',
                    minLength: 3,
                  })}
                  name="full_name"
                  placeholder="Enter your full name"
                  required
                  type="text"
                />
              </div>
              <div>
                <Label
                  aria-required="true"
                  className="mb-1 block font-medium text-gray-700 text-sm"
                  htmlFor="phone"
                >
                  Phone <span className="text-teal-500">*</span>
                </Label>
                <Input
                  {...form.register('phone', {
                    required: 'This field is required',
                    minLength: 10,
                    maxLength: 15,
                  })}
                  pattern="[0-9]*"
                  placeholder="Enter your phone number"
                  title="Please enter a valid phone number"
                  type="tel"
                />
              </div>

              <div>
                <Label
                  className="font-medium text-foreground text-sm"
                  htmlFor="password"
                >
                  New password <span className="text-teal-500">*</span>
                </Label>
                <Input
                  id="password"
                  placeholder="New password"
                  type="password"
                  {...form.register('password')}
                  className={cn(
                    'mt-1 block w-full',
                    'border-input bg-background text-foreground',
                    'placeholder:text-muted-foreground',
                    'focus-visible:ring-ring focus-visible:ring-offset-background'
                  )}
                />
                {form.formState.errors.password && (
                  <p className="mt-1 text-destructive text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label
                  className="font-medium text-foreground text-sm"
                  htmlFor="confirmPassword"
                >
                  Confirm password <span className="text-teal-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  placeholder="Confirm password"
                  type="password"
                  {...form.register('confirmPassword')}
                  className={cn(
                    'mt-1 block w-full',
                    'border-input bg-background text-foreground',
                    'placeholder:text-muted-foreground',
                    'focus-visible:ring-ring focus-visible:ring-offset-background'
                  )}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="mt-1 text-destructive text-sm">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
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
      </div>
    </Card>
  );
}
