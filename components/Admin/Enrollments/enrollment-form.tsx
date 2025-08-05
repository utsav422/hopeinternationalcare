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
import {
  ZodEnrollmentInsertSchema,
  type ZodEnrollmentInsertType,
} from '@/utils/db/drizzle-zod-schema/enrollment';
import {
  EnrollmentStatus,
  //   durationType as durationTypeEnum,
  enrollmentStatus as enrollmentStatusEnum,
} from '@/utils/db/schema/enums';


// type CourseFormInput = TablesInsert<'courses'>
interface Props {
  id?: string;
  formTitle?: string;
}

export default function ({ id, formTitle }: Props) {
  const router = useRouter();
  const [_selecredPrice, setSelectedPrice] = useState<number | null>(null);
  const {
    isLoading,
    error,
    data: queryResult,
  } = useGetEnrollmentById(id ?? '');
  const initialData = queryResult?.data ?? undefined;
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
    try {
      const result = await adminUpsertEnrollment({
        ...values,
      });
      if (!result.success && result.errors) {
        throw new Error(result.errors);
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
    <Card className="w-full max-w-screen-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
      <CardHeader className="dark:border-b dark:border-gray-700">
        <CardTitle className="dark:text-gray-100">{formTitle}</CardTitle>
        <CardDescription className="dark:text-gray-400">Fill all the inputs of below form</CardDescription>
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
                    <FormLabel className="dark:text-gray-200">Notes</FormLabel>
                    <FormControl>
                      <Input {...field} value={(notes as string) ?? ''} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
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
                    <FormLabel className="dark:text-gray-200">Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="capitalize dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                          <SelectValue placeholder="Select a enrollment type" />
                        </SelectTrigger>
                        <SelectContent className="capitalize dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                          <SelectGroup>
                            <SelectLabel className="dark:text-gray-400">Enrollment Type</SelectLabel>
                            {enrollmentStatusEnum.enumValues.map((item) => {
                              return (
                                <SelectItem
                                  disabled={Boolean(
                                    initialData?.id &&
                                      item === EnrollmentStatus.cancelled
                                  )}
                                  key={item}
                                  value={item}
                                  className="dark:hover:bg-gray-700"
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
                    <FormLabel className="dark:text-gray-200">Enrollment Date</FormLabel>
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
                        className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="dark:text-gray-400">
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
                    <FormLabel className="dark:text-gray-200">Select Intake</FormLabel>
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
                    <FormLabel className="dark:text-gray-200">Select User</FormLabel>
                    <FormControl>
                      <UserSelect field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="dark:border-t dark:border-gray-700">
            <Button className="w-full dark:bg-teal-600 dark:hover:bg-teal-700 dark:text-white" type="submit">
              {initialData ? 'Update Enrollment' : 'Create Enrollment'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
