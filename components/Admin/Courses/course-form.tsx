'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CourseCategorySelect from '@/components/Custom/course-category-select';
import AffiliationSelect from '@/components/Custom/affiliation-select';
import FormSkeleton from '@/components/Custom/form-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
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
import { useAdminCourseCreate, useAdminCourseUpdate, useSuspenseAdminCourseById } from '@/lib/hooks/admin/courses-optimized';
import { ZodCourseInsertSchema, type ZodInsertCourseType, } from '@/lib/db/drizzle-zod-schema/courses';
import { DurationType, durationType as durationTypeEnum, type TypeDurationType, } from '@/lib/db/schema/enums';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import dynamic from "next/dynamic";
import { Textarea } from '@/components/ui/textarea';



interface Props {
    id?: string;
    formTitle?: string;
}

const MAX_DURATION_LIMITS: Record<TypeDurationType, number> = {
    days: 365, // 1-year max
    week: 52, // 1-year max
    month: 12, // 1-year max
    year: 5, // up to 5 years
};

export default function CourseForm({ id, formTitle }: Props) {
    const router = useRouter();
    const {
        isLoading,
        error,
        data: queryResult,
    } = useSuspenseAdminCourseById(id ?? '');

    if (error) {
        toast.error(error.message);
    }

    const initialData = id && id.length && queryResult?.data?.id === id
        ? queryResult?.data
        : undefined;

    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        initialData?.image_url ?? null
    );

    const form = useForm<ZodInsertCourseType>({
        resolver: zodResolver(ZodCourseInsertSchema),
        defaultValues: initialData || {
            title: '',
            slug: '',
            level: 1,
            duration_type: 'month',
            duration_value: 3,
            price: 0,
            image_url: '',
            category_id: '',
            affiliation_id: '',
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                affiliation_id: initialData.affiliation_id ?? ''
            });
            setPreviewUrl(initialData.image_url ?? null);
        }
    }, [form, initialData]);

    const { isSubmitting } = form.formState;
    const durationType = form.watch('duration_type');
    const MAX_DURATION_VALUE = useMemo(
        () => MAX_DURATION_LIMITS[durationType ?? DurationType.days] ?? 0,
        [durationType]
    );

    const { mutateAsync: createCourse } = useAdminCourseCreate();
    const { mutateAsync: updateCourse } = useAdminCourseUpdate();

    const onSubmit = async (values: ZodInsertCourseType) => {
        try {
            const data = { ...values };
            if (imageFile) {
                // This is a placeholder for the actual image upload logic
                // In a real app, you would upload the image to a service and get a URL
                data.image_url = 'https://example.com/new-image.jpg';
            }

            const promise = initialData
                ? updateCourse({ ...data, id: initialData.id })
                : createCourse(data);

            toast.promise(promise, {
                loading: 'Saving course...',
                success: (res) => {
                    if (res.success) {
                        router.push('/admin/courses');
                        return `Course ${initialData ? 'updated' : 'created'} successfully.`;
                    }
                    throw new Error(res.error || 'An unknown error occurred');
                },
                error: (err) => {
                    return err.message || 'Failed to save course.';
                },
            });
        } catch (error) {
            console.error('Error during form submission:', error);
            toast.error('Failed to save course. Please try again.');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (!file) {
            return;
        }

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPreviewUrl(dataUrl);
                form.setValue('image_url', dataUrl, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    const getButtonText = () => {
        if (isSubmitting) {
            return 'Saving...';
        }
        if (id && initialData) {
            return 'Update Course';
        }
        return 'Create Course';
    };

    if (isLoading) {
        return <FormSkeleton />;
    }

    return (
        <Card >
            <CardHeader >
                <div className="mb-6 space-y-1" >
                    <CardTitle className="font-medium text-lg " >
                        {formTitle}
                    </CardTitle>
                    <CardDescription className="" >
                        Fill in the information about the course.
                    </CardDescription>
                </div>
                <hr />
            </CardHeader>
            <CardContent >
                <Form {...form}>
                    <form
                        className="w-full space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        {/* Course Title Input Field*/}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                                    <div className="space-y-1 md:col-span-1" >
                                        <FormLabel className="font-medium text-sm leading-none " >
                                            Title
                                        </FormLabel>
                                    </div>
                                    <div className="space-y-2 md:col-span-3" >
                                        <FormControl >
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    form.setValue(
                                                        'slug',
                                                        e.target.value.toLowerCase().replace(/\s+/g, '-')
                                                    );
                                                }}
                                                placeholder="Enter title"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course Slug Input Field*/}
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                                    <div className="space-y-1 md:col-span-1" >
                                        <FormLabel className="" > Slug </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs " >
                                            It will be auto - generated from title.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3" >
                                        <FormControl >
                                            <Input
                                                {...field}
                                                disabled
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course Category Input Field*/}
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="">
                                            Category
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs">
                                            categories data are dynamically fetched.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <QueryErrorWrapper>
                                            <Suspense fallback={'loading...'}>
                                                <CourseCategorySelect field={field} />
                                            </Suspense>
                                        </QueryErrorWrapper>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course Affiliation Input Field*/}
                        <FormField
                            control={form.control}
                            name="affiliation_id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="">
                                            Affiliation
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs">
                                            Optional; affiliations are dynamically fetched.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <QueryErrorWrapper>
                                            <Suspense fallback={'loading...'}>
                                                <AffiliationSelect field={field} />
                                            </Suspense>
                                        </QueryErrorWrapper>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course price Input Field*/}
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                                    <div className="space-y-1 md:col-span-1" >
                                        <FormLabel className="" > Price </FormLabel>
                                    </div>
                                    <div className="space-y-2 md:col-span-3" >
                                        <FormControl >
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    if (rawValue === "" || /^\d+$/.test(rawValue)) {
                                                        form.setValue('price', Number(rawValue), { shouldValidate: true });
                                                        // field.onChange(e);
                                                    }
                                                }}
                                                value={field?.value?.toString() ?? ""}
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="Enter the course price amount"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Markdown Description Input Field */}
                        <FormField
                            control={form.control}
                            name="courseHighlights"
                            render={({ field }) => (
                                <FormItem className="grid items-start gap-4" >
                                    <div className="space-y-1" >
                                        <FormLabel className="font-medium text-sm leading-none " >
                                            Course Description
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs " >
                                            Describe your course in details
                                        </FormDescription>
                                    </div>
                                    <div className='space-y-1 border-2 rounded-md border-input' >
                                        <FormControl >
                                            <Textarea />
                                        </FormControl>
                                        <FormDescription className="text-muted-foreground text-xs " >
                                            Supports Markdown formatting
                                        </FormDescription>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course Level Input Field*/}
                        <FormField
                            control={form.control}
                            name="level"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                                    <div className="space-y-1 md:col-span-1" >
                                        <FormLabel className="" > Level </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs " >
                                            Education Level
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3" >
                                        <FormControl >
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    if (rawValue === "" || /^\d+$/.test(rawValue)) {
                                                        if (Number(rawValue) > 5) {
                                                            toast.warning('Level cannot be more than 5');
                                                            return;
                                                        }
                                                        form.setValue('level', Number(rawValue), { shouldValidate: true });

                                                        // field.onChange(e);
                                                    }
                                                }}
                                                value={field?.value?.toString() ?? ""}
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="Enter the course level number from 1 to 5"
                                            />

                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course Duration type Input Field*/}
                        <FormField
                            control={form.control}
                            name="duration_type"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                                    <div className="space-y-1 md:col-span-1" >
                                        <FormLabel className="" >
                                            Duration Type
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs " >
                                            Select Duration Type days / weeks / months / years
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3" >
                                        <FormControl >
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full " >
                                                    <SelectValue placeholder="Select a duration type" />
                                                </SelectTrigger>
                                                <SelectContent >
                                                    <SelectGroup >
                                                        <SelectLabel >Duration Type </SelectLabel>
                                                        {
                                                            durationTypeEnum.enumValues.map((item) => {
                                                                return (
                                                                    <SelectItem
                                                                        className="capitalize"
                                                                        key={item}
                                                                        value={item}
                                                                    >
                                                                        {item}
                                                                    </SelectItem>
                                                                );
                                                            })
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course Duration value Input Field*/}
                        <FormField
                            control={form.control}
                            name="duration_value"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                                    <div className="space-y-1 md:col-span-1" >
                                        <FormLabel className="" >
                                            Duration Value
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs " >
                                            Enter selected duration type value
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3" >
                                        <FormControl >
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    if (rawValue === "" || /^\d+$/.test(rawValue)) {
                                                        form.setValue('duration_value', Number(rawValue), { shouldValidate: true });
                                                        // field.onChange(e);
                                                    }
                                                }}
                                                value={field?.value?.toString() ?? ""}
                                                type="text"
                                                inputMode="decimal"
                                                placeholder={"Enter the course duration value for selected duration type i.e " + durationType}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        {/* Course Cover Image Input Field*/}
                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                                    <div className="space-y-1 md:col-span-1" >
                                        <FormLabel className="font-medium text-sm leading-none " >
                                            Cover Image
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs " >
                                            JPG, PNG or GIF(max 2MB)
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3" >
                                        <FormControl >
                                            <div className="space-y-3" >
                                                {
                                                    previewUrl ? (
                                                        <div className="mt-2" >
                                                            <Image unoptimized={true}
                                                                alt="Preview"
                                                                className="max-h-48 rounded-md object-cover"
                                                                height={100}
                                                                src={previewUrl.trim()}
                                                                width={100}
                                                            />
                                                        </div>
                                                    ) : null
                                                }

                                                <Input
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        handleImageChange(e);
                                                    }}
                                                    ref={fileRef}
                                                    type="file"
                                                />

                                                <button
                                                    className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:bg-accent"
                                                    onClick={() => fileRef.current?.click()}
                                                    type="button"
                                                >
                                                    <div className="text-center" >
                                                        <p className="font-medium text-sm " >
                                                            Upload a file
                                                        </p>
                                                        <p className="mt-1 text-muted-foreground text-xs " >
                                                            Drag & drop or click to browse
                                                        </p>
                                                    </div>
                                                </button>

                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4" >
                            <div className="space-y-1 md:col-span-1" >
                                <FormLabel className="font-medium text-sm leading-none " >
                                    Action{' '}
                                </FormLabel>{' '}
                                <FormDescription className="text-muted-foreground text-xs " >
                                    Submit Action Button For{' '}
                                    {initialData ? 'Updating' : 'Creating'} Course
                                </FormDescription>
                            </div>
                            <div >
                                <Button
                                    disabled={isSubmitting}
                                    type="submit"
                                >
                                    {
                                        isSubmitting && (
                                            <svg
                                                className="mr-2 h-4 w-4 animate-spin"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <title > Loading </title>
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
                                        )
                                    }
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
