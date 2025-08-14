'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CourseSelect from '@/components/Custom/course-select';
import FormSkeleton from '@/components/Custom/form-skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { useGetIntakeById, useUpsertIntake } from '@/hooks/admin/intakes';
import {
    type ZodInsertIntakeType,
    ZodIntakeInsertSchema,
} from '@/lib/db/drizzle-zod-schema/intakes';
import { cn } from '@/utils/utils';

interface IntakeFormProps {
    id?: string;
    formTitle?: string;
}

export default function IntakeForm({ id, formTitle }: IntakeFormProps) {
    const router = useRouter();
    const { data: queryResult, error } = useGetIntakeById(id ?? '');
    if (error) {
        toast.error('Error fetching intake details', {
            description: error.message,
        });
    }
    const initialData = queryResult;
    const { mutateAsync: upsertIntake } = useUpsertIntake();

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

    const onSubmit = (values: ZodInsertIntakeType) => {
        toast.promise(upsertIntake(values), {
            loading: 'Saving intake...',
            success: () => {
                router.push('/admin/intakes');
                return `Intake ${initialData ? 'updated' : 'created'} successfully.`;
            },
            error: 'Failed to save intake.',
        });
    };

    const { isSubmitting } = form.formState;
    const getButtonText = () => {
        if (isSubmitting) {
            return 'Saving...';
        }
        if (id) {
            return 'Update Intake';
        }
        return 'Create Intake';
    };
    return (
        <Card>
            <CardHeader>
                <div className="mb-6 space-y-1">
                    <CardTitle className="font-medium text-lg">
                        {formTitle}
                    </CardTitle>
                    <CardDescription className="">
                        Fill in the information about the category.
                    </CardDescription>
                </div>
                <hr />
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="w-full space-y-8"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="course_id"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                        <div className="space-y-1 md:col-span-1">
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                Course
                                            </FormLabel>
                                            <FormDescription className="text-muted-foreground  ">
                                                Select the course for this intake.
                                            </FormDescription>
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <FormControl>
                                                <CourseSelect field={field} />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                        <div className="space-y-1 md:col-span-1">
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                Start Date
                                            </FormLabel>
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            className={cn(
                                                                'w-full bg-white pl-3 text-left font-normal',

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
                                                <PopoverContent
                                                    align="start"
                                                    className="w-auto p-0 "
                                                >
                                                    <Calendar
                                                        initialFocus
                                                        mode="single"
                                                        onSelect={(date) =>
                                                            field.onChange(date?.toISOString())
                                                        }
                                                        selected={
                                                            field.value ? new Date(field.value) : undefined
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                        <div className="space-y-1 md:col-span-1">
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                End Date
                                            </FormLabel>
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            className={cn(
                                                                'w-full bg-white pl-3 text-left font-normal',
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
                                                <PopoverContent
                                                    align="start"
                                                    className="w-auto p-0 "
                                                >
                                                    <Calendar
                                                        initialFocus
                                                        mode="single"
                                                        onSelect={(date) =>
                                                            field.onChange(date?.toISOString())
                                                        }
                                                        selected={
                                                            field.value ? new Date(field.value) : undefined
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                        <div className="space-y-1 md:col-span-1">
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                Capacity
                                            </FormLabel>
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value === ''
                                                                ? null
                                                                : e.target.valueAsNumber
                                                        )
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
                                name="total_registered"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                        <div className="space-y-1 md:col-span-1">
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                Total Registered
                                            </FormLabel>

                                            {id && id?.length > 0 && initialData ? null : <FormDescription className="text-muted-foreground  "> This is automactically handled by the application </FormDescription>}
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    min={0}
                                                    disabled
                                                    type="number"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value === ''
                                                                ? null
                                                                : e.target.valueAsNumber
                                                        )
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
                                name="is_open"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                        <div className="space-y-1 md:col-span-1">
                                            <FormLabel className="font-medium text-sm leading-none ">
                                                Is this intake currently open for enrollment?
                                            </FormLabel>
                                        </div>
                                        <div className="space-y-2 md:col-span-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={!!field.value}
                                                    className="mr-2"
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                            <div className="space-y-1 md:col-span-1">
                                <FormLabel className="font-medium text-sm leading-none ">
                                    Action{' '}
                                </FormLabel>{' '}
                                <FormDescription className="text-muted-foreground  ">
                                    Submit Action Button For{' '}
                                    {initialData ? 'Updating' : 'Creating'} Intake
                                </FormDescription>
                            </div>
                            <div>
                                <Button

                                    disabled={isSubmitting}
                                    type="submit"
                                >
                                    {' '}
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
