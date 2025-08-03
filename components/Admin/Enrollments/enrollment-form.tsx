// /components/Admin/Courses/CourseModal.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import IntakeSelect from '@/components/Custom/intake-select';
import UserSelect from '@/components/Custom/user-select';
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
import { useGetEnrollmentById } from '@/hooks/enrollments';
import { adminUpsertEnrollment } from '@/server-actions/admin/enrollments';
import type { IntakeWithCourseTitleWithPrice } from '@/server-actions/admin/intakes';
import { adminUpsertPayment } from '@/server-actions/admin/payments';
import {
  ZodEnrollmentInsertSchema,
  type ZodInsertEnrollmentType,
} from '@/utils/db/drizzle-zod-schema/enrollment';
import {
  EnrollmentStatus,
  //   durationType as durationTypeEnum,
  enrollmentStatus as enrollmentStatusEnum,
  PaymentMethod,
  PaymentStatus,
  //   paymentStatus as paymentStatusEnum,
} from '@/utils/db/schema/enums';

type ServerActionResponse = {
  success: boolean;
  message?: string;
  errors?: string;
};
// type CourseFormInput = TablesInsert<'courses'>
interface Props {
  id?: string;
  formTitle?: string;
}

export default function ({ id, formTitle }: Props) {
  const router = useRouter();
  const [selecredPrice, setSelectedPrice] = useState<number | null>(null);
  const {
    isLoading,
    error,
    data: queryResult,
  } = useGetEnrollmentById(id ?? '');
  const initialData = queryResult?.data ?? undefined;
  //   courseData && courseData.price;
  const form = useForm<ZodInsertEnrollmentType>({
    resolver: zodResolver(ZodEnrollmentInsertSchema),
    defaultValues: initialData || {
      intake_id: null,
      user_id: null,
      status: 'requested',
      notes: null,
      enrollment_date: new Date().toISOString(),
      cancelled_reason: null,
      created_at: new Date().toISOString(),
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const notes = form.watch('notes');
  const enrollment_status = form.watch('status');
  const onSubmit = async (values: ZodInsertEnrollmentType) => {
    try {
      const result = await adminUpsertEnrollment({
        ...values,
      });
      if (!result.success && result.message) {
        throw new Error(result.message.toString());
      }
      if (!result.data) {
        throw new Error(result.message ?? 'Somethingwent wrong');
      }
      const paymentRes: ServerActionResponse = await adminUpsertPayment({
        enrollment_id: result.data[0].id,
        remarks: (() => {
          switch (enrollment_status) {
            case 'requested':
              return 'payment has been pending';
            case 'enrolled':
              return 'payment has been complete';
            default:
              return 'payment has been failed/cancelled';
          }
        })(),
        amount: selecredPrice as number,
        method: PaymentMethod.cash,
        status: (() => {
          switch (enrollment_status) {
            case 'requested':
              return PaymentStatus.pending;
            case 'enrolled':
              return PaymentStatus.completed;
            default:
              return PaymentStatus.failed;
          }
        })(),
      });
      if (paymentRes?.success) {
        toast.success('Payment details created successfully!');
      } else {
        toast.error(paymentRes?.message || 'Failed to update payment details.');
      }
      toast.success(values.id ? 'Enrollment updated' : 'Enrollment created');
      router.push(`/admin/enrollments?status?=${values.status}`, {
        scroll: false,
      });
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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
    <Card className="w-full max-w-screen-lg">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <CardDescription>Fill all the inputs of below form</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form className="space-y-6 p-4" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mr-auto">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} value={(notes as string) ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 flex space-x-5">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="capitalize">
                          <SelectValue placeholder="Select a enrollment type" />
                        </SelectTrigger>
                        <SelectContent className="capitalize">
                          <SelectGroup>
                            <SelectLabel>Enrollment Type</SelectLabel>
                            {enrollmentStatusEnum.enumValues.map((item) => {
                              return (
                                <SelectItem
                                  disabled={Boolean(
                                    initialData?.id &&
                                      item === EnrollmentStatus.cancelled
                                  )}
                                  key={item}
                                  value={item}
                                >
                                  {item}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="enrollment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      This will take the current date and time
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="intake_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Intake</FormLabel>
                    <FormControl>
                      <IntakeSelect
                        field={field}
                        getItemOnValueChanges={(
                          selectedIntakes: IntakeWithCourseTitleWithPrice
                        ) => setSelectedPrice(selectedIntakes.coursePrice)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-12">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select User</FormLabel>
                    <FormControl>
                      <UserSelect field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              {initialData ? 'Update Enrollment' : 'Create Enrollment'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
