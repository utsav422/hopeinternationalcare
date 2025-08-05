'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import EnrollmentSelect from '@/components/Custom/enrollment-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPaymentOnlyDetailsById } from '@/hooks/payments';
import { adminUpsertPayment } from '@/server-actions/admin/payments';
import type { CustomEnrollmentsAndOthers } from '@/utils/db/drizzle-zod-schema/enrollment';
import {
  type ZodInsertPaymentType,
  ZodPaymentInsertSchema,
} from '@/utils/db/drizzle-zod-schema/payments';
import { PaymentMethod, PaymentStatus } from '@/utils/db/schema/enums';

interface Props {
  id?: string;
  formTitle?: string;
}

export default function PaymentForm({ id, formTitle }: Props) {
  const router = useRouter();
  const {
    data: queryResult,
    isLoading,
    error,
  } = useGetPaymentOnlyDetailsById(id ?? '');
  const initialData = queryResult?.data;
  const form = useForm<ZodInsertPaymentType>({
    resolver: zodResolver(ZodPaymentInsertSchema),
    defaultValues: initialData || {
      enrollment_id: '',
      amount: 0,
      method: PaymentMethod.cash,
      status: PaymentStatus.pending,
      remarks: null,
      paid_at: new Date().toISOString(),
      is_refunded: false,
    },
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ZodInsertPaymentType) => {
    await toast.promise(adminUpsertPayment(values), {
      loading: 'Saving payment...',
      success: () => {
        router.push('/admin/payments');
        return `Payment ${initialData ? 'updated' : 'created'} successfully.`;
      },
      error: (err) => err.message || 'Failed to save payment.',
    });
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return 'Saving...';
    }
    if (initialData) {
      return 'Update Payment';
    }
    return 'Create Payment';
  };
  if (error) {
    toast.error('Something went wrong while fetching categories', {
      description: error.message,
    });
  }
  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="mb-6 space-y-1">
          <h3 className="font-medium text-lg dark:text-white">{formTitle}</h3>
          <p className="text-muted-foreground text-sm dark:text-gray-400">
            Fill in the information about the payment.
          </p>
        </div>
        <hr className="dark:border-gray-600" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="w-full space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="enrollment_id"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">Enrollment</FormLabel>
                    <FormDescription className="text-xs dark:text-gray-400">
                      Select the student enrollment.
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <EnrollmentSelect
                        field={field}
                        getItemOnValueChanges={(
                          enrollmentSelect: CustomEnrollmentsAndOthers
                        ) => {
                          if (enrollmentSelect.coursePrice) {
                            form.setValue(
                              'amount',
                              enrollmentSelect.coursePrice
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">Amount</FormLabel>
                    <FormDescription className="text-xs dark:text-gray-400">
                      Amount is set from the course price.
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : e.target.valueAsNumber
                          )
                        }
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">Payment Method</FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                        <SelectContent className="capitalize dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                          <SelectGroup>
                            <SelectLabel>Payment Method</SelectLabel>
                            {Object.values(PaymentMethod).map((method) => (
                              <SelectItem
                                className="capitalize dark:hover:bg-gray-700"
                                key={method}
                                value={method}
                              >
                                {method}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">Payment Status</FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select a payment status" />
                        </SelectTrigger>
                        <SelectContent className="capitalize dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                          <SelectGroup>
                            <SelectLabel>Payment Status</SelectLabel>
                            {Object.values(PaymentStatus).map((status) => (
                              <SelectItem
                                className="capitalize dark:hover:bg-gray-700"
                                key={status}
                                value={status}
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">Remarks</FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
              <div className="space-y-1 md:col-span-1">
                <FormLabel className="font-medium text-sm leading-none dark:text-gray-200">
                  Action
                </FormLabel>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Button disabled={isSubmitting} type="submit" className="dark:bg-teal-600 dark:hover:bg-teal-700 dark:text-white">
                  {isSubmitting && (
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Loading</title>
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {getButtonText()}
                </Button>
              </div>
            </FormItem>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
