'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CourseSelect from '@/components/Custom/course-select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetIntakeById } from '@/hooks/intakes';
import { adminUpsertIntake } from '@/server-actions/admin/intakes';
import {
  type ZodInsertIntakeType,
  ZodIntakeInsertSchema,
} from '@/utils/db/drizzle-zod-schema/intakes';
import { cn } from '@/utils/utils';

interface IntakeFormProps {
  id?: string;
}

export default function IntakeForm({ id }: IntakeFormProps) {
  const router = useRouter();
  const { data: queryResult, isLoading, error } = useGetIntakeById(id ?? '');
  if (error) {
    toast.error('Error fetching intake details', {
      description: error.message,
    });
  }
  const initialData = queryResult?.data;

  const form = useForm<ZodInsertIntakeType>({
    resolver: zodResolver(ZodIntakeInsertSchema),
    defaultValues: initialData || {
      course_id: null,
      start_date: '',
      end_date: '',
      capacity: 20,
      is_open: true,
      total_registered: 0,
    },
  });

  const onSubmit = async (values: ZodInsertIntakeType) => {
    await toast.promise(adminUpsertIntake(values), {
      loading: 'Saving intake...',
      success: () => {
        router.push('/admin/intakes');
        return `Intake ${initialData ? 'updated' : 'created'} successfully.`;
      },
      error: 'Failed to save intake.',
    });
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-lg dark:text-gray-100">Intake Details</h2>
          <p className="text-muted-foreground text-sm dark:text-gray-400">
            Fill in the information about the intake.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Course</FormLabel>
                  <FormControl>
                    <CourseSelect field={field} />
                  </FormControl>
                  <FormDescription className="text-xs dark:text-gray-400">
                    Select the course for this intake.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="dark:text-gray-200">Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          className={cn(
                            'w-full pl-3 text-left font-normal bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
                            !field.value && 'text-muted-foreground dark:text-gray-400'
                          )}
                          variant="outline"
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700">
                      <Calendar
                        initialFocus
                        mode="single"
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="dark:text-gray-200">End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          className={cn(
                            'w-full pl-3 text-left font-normal bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
                            !field.value && 'text-muted-foreground dark:text-gray-400'
                          )}
                          variant="outline"
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700">
                      <Calendar
                        initialFocus
                        mode="single"
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_registered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Total Registered</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_open"
              render={({ field }) => (
                <FormItem className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      className="mr-2 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-teal-500 dark:checked:text-white"
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>
                    <label
                      className="font-medium text-sm leading-none dark:text-gray-200"
                      htmlFor="is_open"
                    >
                      Is this intake currently open for enrollment?
                    </label>
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit" className="dark:bg-teal-600 dark:hover:bg-teal-700 dark:text-white">Save</Button>
      </form>
    </Form>
  );
}
