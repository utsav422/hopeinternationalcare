'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import {
    useGetCourseCategoryById,
    useUpsertCourseCategory,
} from '@/hooks/admin/course-categories';
import {
    ZodCourseCategoryInsertSchema,
    type ZodInsertCourseCategoryType,
    //   type ZTSelectCourseCategories,
} from '@/lib/db/drizzle-zod-schema/course-categories';

interface Props {
    id?: string;
    //   initialData?: ZTSelectCourseCategories;
    formTitle: string;
}

export default function CategoryForm({ id, formTitle }: Props) {
    const router = useRouter();
    const { data: initialDataResult, error } = useGetCourseCategoryById(id ?? '');

    const initialData = id && id.length > 0 && initialDataResult?.success
        ? initialDataResult.data
        : undefined;

    if (error) {
        toast.error('Something went wrong while fetching categories', {
            description: error.message,
        });
    }

    if (initialDataResult && !initialDataResult.success) {
        toast.error('Data validation error', {
            description: JSON.stringify(initialDataResult.error),
        });
    }

    const form = useForm<ZodInsertCourseCategoryType>({
        resolver: zodResolver(ZodCourseCategoryInsertSchema),
        defaultValues: initialData ?? {
            name: '',
            description: '',
        },
    });
    const { isSubmitting } = form.formState;
    const { mutateAsync: upsertCategory } = useUpsertCourseCategory();

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    const onSubmit = async (values: ZodInsertCourseCategoryType) => {
        toast.promise(upsertCategory(values), {
            loading: 'Saving category...',
            success: () => {
                router.push('/admin/categories');
                return `Category ${initialData ? 'updated' : 'created'} successfully.`;
            },
            error: (error) => error instanceof Error ? error.message : 'Failed to save category.',
        });
    };

    const getButtonText = () => {
        if (isSubmitting) {
            return 'Saving...';
        }
        if (id && initialData) {
            return 'Update Category';
        }
        return 'Create Category';
    };

    return (
        <Card className="">
            <CardHeader>
                <div className="mb-6 space-y-1">
                    <h3 className="font-medium text-lg">
                        {formTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm ">
                        Fill in the information about the category.
                    </p>
                </div>
                <hr />
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="w-full space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="">Name</FormLabel>
                                        <FormDescription className="text-xs ">
                                            The name of the category.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Web Development"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="">
                                            Description
                                        </FormLabel>
                                        <FormDescription className="text-xs ">
                                            A brief description of the category.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Enter a description..."
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                            <div className="space-y-1 md:col-span-1">
                                <FormLabel className="font-medium text-sm leading-none ">
                                    Action
                                </FormLabel>
                                <FormDescription className="text-muted-foreground text-xs ">
                                    Submit the form.
                                </FormDescription>
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <Button
                                    disabled={isSubmitting}
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
                                </Button>
                            </div>
                        </FormItem>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
