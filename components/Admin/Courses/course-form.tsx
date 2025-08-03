// /components/Admin/Courses/CourseModal.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type ControllerRenderProps,
  type FieldValues,
  useForm,
} from 'react-hook-form';
import { toast } from 'sonner';
import CourseCategorySelect from '@/components/Custom/course-category-select';
import { ControlledMDXEditor } from '@/components/mdx/controlled-mdx-editor';
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
import { useUpsertCourse } from '@/hooks/courses';
import { useGetPublicCourseBySlug } from '@/hooks/public-courses';
import {
  ZodCourseInsertSchema,
  type ZodInsertCourseType,
} from '@/utils/db/drizzle-zod-schema/courses';
import {
  DurationType,
  durationType as durationTypeEnum,
  type TypeDurationType,
} from '@/utils/db/schema/enums';

interface Props {
  slug?: string;
  formTitle?: string;
}

const MAX_DURATION_LIMITS: Record<TypeDurationType, number> = {
  days: 365, // 1 year max
  week: 52, // 1 year max
  month: 12, // 1 year max
  year: 5, // up to 5 years
};

export default function ({ slug, formTitle }: Props) {
  const router = useRouter();
  const {
    isLoading,
    error,
    data: queryResult,
  } = useGetPublicCourseBySlug(slug ?? '');
  const initialData = queryResult?.data ?? undefined;
  if (error) {
    toast.error('Something went wrong while fetching categories', {
      description: error.message,
    });
  }

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
      description: '',
      level: 1,
      duration_type: 'month',
      duration_value: 3,
      price: 0,
      image_url: '',
      category_id: '',
    },
  });
  const { isSubmitting } = form.formState;
  const durationType = form.watch('duration_type');
  const MAX_DURATION_VALUE = useMemo(
    () => MAX_DURATION_LIMITS[durationType ?? DurationType.days] ?? 0,
    [durationType]
  );

  const { mutateAsync: upsertCourse } = useUpsertCourse();

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      setPreviewUrl(initialData.image_url ?? null);
    }
  }, [initialData, form]);

  const onSubmit = async (values: ZodInsertCourseType) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    }

    if (imageFile) {
      formData.append('image_file', imageFile);
    }
    if (initialData?.image_url) {
      formData.append('image_url', initialData.image_url);
    }

    await toast.promise(upsertCourse(formData), {
      loading: 'Saving course...',
      success: (res: {
        success: boolean;
        message?: string;
        errors?: Record<string, string[] | undefined>;
        data?: ZodInsertCourseType;
      }) => {
        if (res.success) {
          router.push('/admin/courses');
          return `Course ${slug ? 'updated' : 'created'} successfully.`;
        }
        throw new Error(res.message || 'An unknown error occurred');
      },
      error: (err: Error) => {
        return err.message || 'Failed to save course.';
      },
    });
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
    if (slug) {
      return 'Update Course';
    }
    return 'Create Course';
  };
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
    <Card>
      <CardHeader>
        <div className="mb-6 space-y-1">
          <h3 className="font-medium text-lg">{formTitle}</h3>
          <p className="text-muted-foreground text-sm">
            Fill in the information about the course.
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
            {/* Course Title Input Field*/}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="font-medium text-sm leading-none">
                      Title
                    </FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
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
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel>Slug</FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      It will be auto-generated from title.
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input {...field} disabled />
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
                    <FormLabel>Category</FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      categories data are dynamicaly fetched.
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <CourseCategorySelect field={field} />
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
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel>Price</FormLabel>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : e.target.valueAsNumber
                          )
                        }
                        type="number"
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
              name="description"
              render={({ field, fieldState }) => (
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="font-medium text-sm leading-none">
                      Course Description
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      Describe your course in details
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <ControlledMDXEditor
                        field={
                          field as unknown as ControllerRenderProps<
                            FieldValues,
                            string
                          >
                        }
                        status={{
                          isDirty: fieldState.isDirty,
                          invalid: !!fieldState.error,
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-xs">
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
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel>Level</FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      Education Level
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        {...field}
                        max={5}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : e.target.valueAsNumber
                          )
                        }
                        placeholder="enter the course level"
                        type="number"
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
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel>Duration Type</FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      Select Duration Type days/weeks/months/years
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a duration type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Duration Type</SelectLabel>
                            {durationTypeEnum.enumValues.map((item) => {
                              return (
                                <SelectItem
                                  className="capitalize"
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
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel>Duration Value</FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      Enter selected duration type value
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="w-all"
                        max={MAX_DURATION_VALUE}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : e.target.valueAsNumber
                          )
                        }
                        placeholder="Enter the duration value"
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
                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                  <div className="space-y-1 md:col-span-1">
                    <FormLabel className="font-medium text-sm leading-none">
                      Cover Image
                    </FormLabel>
                    <FormDescription className="text-muted-foreground text-xs">
                      JPG, PNG or GIF (max 2MB)
                    </FormDescription>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <FormControl>
                      <div className="space-y-3">
                        {previewUrl ? (
                          <div className="mt-2">
                            <Image
                              alt="Preview"
                              className="max-h-48 rounded-md object-cover"
                              height={100}
                              src={previewUrl.trim()}
                              width={100}
                            />
                          </div>
                        ) : null}

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
                          <div className="text-center">
                            <p className="font-medium text-sm">Upload a file</p>
                            <p className="mt-1 text-muted-foreground text-xs">
                              Drag & drop or click to browse
                            </p>
                          </div>
                          {/* <p className="text-muted-foreground text-xs">
                            {field.value || 'No file selected'}
                            </p> */}
                        </button>
                        <pre>{JSON.stringify(field?.value, null, 2)}</pre>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />
            <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
              <div className="space-y-1 md:col-span-1">
                <FormLabel className="font-medium text-sm leading-none">
                  Action{' '}
                </FormLabel>{' '}
                <FormDescription className="text-muted-foreground text-xs">
                  Submit Action Button For{' '}
                  {initialData ? 'Updating' : 'Creating'} Course
                </FormDescription>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Button disabled={isSubmitting} type="submit">
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
