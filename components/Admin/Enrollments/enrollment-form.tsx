'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
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
import {
  useGetEnrollmentById,
  useUpsertEnrollment,
} from '@/hooks/admin/enrollments';
import {
  ZodEnrollmentInsertSchema,
  type ZodEnrollmentInsertType,
} from '@/lib/db/drizzle-zod-schema/enrollments';
import {
  EnrollmentStatus,
  //   durationType as durationTypeEnum,
  enrollmentStatus as enrollmentStatusEnum,
} from '@/lib/db/schema/enums';
import type { IntakeWithCourse } from '@/lib/server-actions/admin/intakes';

// type CourseFormInput = TablesInsert<'courses'>
interface Props {
  id?: string;
  formTitle?: string;
}

export default function ({ formTitle }: Props) {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [_selecredPrice, setSelectedPrice] = useState<number | null>(null);
  const {
    isLoading,
    error,
    data: queryResult,
  } = useGetEnrollmentById(id ?? '');
  const { mutateAsync: upsertEnrollment } = useUpsertEnrollment();
  const initialData = queryResult ?? undefined;
  //   courseData && courseData.price;
  const form = useForm<ZodEnrollmentInsertType>({
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
  const onSubmit = async (values: ZodEnrollmentInsertType) => {
    await toast.promise(upsertEnrollment(values), {
      loading: 'Saving enrollment...',
      success: () => {
        router.push(`/admin/enrollments?status?=${values.status}`, {
          scroll: false,
        });
        return values.id ? 'Enrollment updated' : 'Enrollment created';
      },
      error: 'Failed to save enrollment',
    });
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
  const getButtonText = () => {
    if (isSubmitting) {
      return 'Saving...';
    }
    if (id) {
      return 'Update Enrollment';
    }
    return 'Create Enrollment';
  };
  const { isSubmitting } = form.formState;

  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <CardHeader className="dark:border-gray-700 dark:border-b">
        <CardTitle className="dark:text-gray-100">{formTitle}</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Fill all the inputs of below form
        </CardDescription>
        <hr className="dark:border-gray-600" />
      </CardHeader>
      <CardContent className="grid grid-cols-12 gap-4">
        <Form {...form}>
          <form
            className="w-full space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">Notes</FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        {...field}
                        className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        value={(notes as string) ?? ''}
                      />
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
                    <FormLabel className="dark:text-gray-200">Status</FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="capitalize dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          <SelectValue placeholder="Select a enrollment type" />
                        </SelectTrigger>
                        <SelectContent className="capitalize dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                          <SelectGroup>
                            <SelectLabel className="dark:text-gray-400">
                              Enrollment Type
                            </SelectLabel>
                            {enrollmentStatusEnum.enumValues.map((item) => {
                              return (
                                <SelectItem
                                  className="dark:hover:bg-gray-700"
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
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enrollment_date"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">
                      Enrollment Date
                    </FormLabel>
                    <FormDescription className="dark:text-gray-400">
                      This will take the current date and time
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        disabled
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intake_id"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">
                      Select Intake
                    </FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <IntakeSelect
                        field={field}
                        getItemOnValueChanges={(
                          selectedIntakes: IntakeWithCourse
                        ) => setSelectedPrice(selectedIntakes.coursePrice)}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="dark:text-gray-200">
                      Select User
                    </FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <UserSelect field={field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
              <div className="space-y-1 md:col-span-1">
                <FormLabel className="font-medium text-sm leading-none dark:text-white">
                  Action
                </FormLabel>
                <FormDescription className="text-muted-foreground text-xs dark:text-gray-400">
                  Submit Action Button For
                  {initialData ? 'Updating' : 'Creating'} Enrollment
                </FormDescription>
              </div>
              <div className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                <Button
                  className="dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700"
                  type="submit"
                >
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
                  {initialData ? 'Update Enrollment' : 'Create Enrollment'}
                </Button>
              </div>
            </FormItem>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
