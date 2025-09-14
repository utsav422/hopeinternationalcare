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
import { useAdminAffiliationById, useAdminAffiliationUpsert } from '@/hooks/admin/affiliations';
import {
    ZodAffiliationInsertSchema,
    type ZodInsertAffiliationType,
    type ZodSelectAffiliationType,
} from '@/lib/db/drizzle-zod-schema/affiliations';
import type { AffiliationFormData } from '@/lib/server-actions/admin/affiliations';

interface Props {
    id?: string;
    formTitle: string;
}

export default function AffiliationForm({ id, formTitle }: Props) {
    const router = useRouter();
    const { data: initialDataResult, error } = useAdminAffiliationById(id || '');

    const initialData = id && id.length > 0 && initialDataResult?.success
        ? initialDataResult.data
        : undefined;

    if (error) {
        toast.error('Something went wrong while fetching affiliation', {
            description: error.message,
        });
    }

    if (initialDataResult && !initialDataResult.success) {
        toast.error('Data validation error', {
            description: JSON.stringify(initialDataResult.error),
        });
    }

    const form = useForm<ZodInsertAffiliationType>({
        resolver: zodResolver(ZodAffiliationInsertSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            type: initialData.type,
            description: initialData.description || ''
        } : {
            name: '',
            type: '',
            description: '',
        },
    });

    const { isSubmitting, isLoading } = form.formState;
    const { mutateAsync: upsertAffiliation } = useAdminAffiliationUpsert();

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                description: initialData.description || ''
            });
        }
    }, [initialData, form]);

    const onSubmit = async (values: ZodInsertAffiliationType) => {
        try {
            // Remove null values to match AffiliationFormData type
            const formData: AffiliationFormData = {
                id: values.id,
                name: values.name,
                type: values.type,
                description: values.description || undefined
            };
            
            const result = await upsertAffiliation(formData);
            
            if (result.success) {
                toast.success(`Affiliation ${id ? 'updated' : 'created'} successfully.`);
                router.push('/admin/affiliations');
            } else {
                // Handle duplicate name error
                if (result.error && result.error.includes('already exists')) {
                    form.setError('name', {
                        type: 'manual',
                        message: result.error
                    });
                    toast.error(result.error);
                } else {
                    throw new Error(result.error || 'An unknown error occurred');
                }
            }
        } catch (error) {
            toast.error(`Failed to save affiliation.`, {
                description: error instanceof Error ? error.message : 'Please try again.'
            });
        }
    };

    const getButtonText = () => {
        if (isSubmitting) {
            return 'Saving...';
        }
        if (id && initialData) {
            return 'Update Affiliation';
        }
        return 'Create Affiliation';
    };

    return (
        <Card>
            <CardHeader>
                <div className="mb-6 space-y-1">
                    <h3 className="font-medium text-lg">
                        {formTitle}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Fill in the information about the affiliation.
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="w-full space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        {/* Name Input Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="font-medium text-sm leading-none">
                                            Name
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs">
                                            The name of the affiliation.
                                        </FormDescription>
                                    </div>
                                    <div className="md:col-span-3">
                                        <FormControl>
                                            <Input
                                                disabled={isSubmitting || isLoading}
                                                placeholder="Enter affiliation name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Type Input Field */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="font-medium text-sm leading-none">
                                            Type
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs">
                                            The type of the affiliation.
                                        </FormDescription>
                                    </div>
                                    <div className="md:col-span-3">
                                        <FormControl>
                                            <Input
                                                disabled={isSubmitting || isLoading}
                                                placeholder="Enter affiliation type"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Description Input Field */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="font-medium text-sm leading-none">
                                            Description
                                        </FormLabel>
                                        <FormDescription className="text-muted-foreground text-xs">
                                            A brief description of the affiliation.
                                        </FormDescription>
                                    </div>
                                    <div className="md:col-span-3">
                                        <FormControl>
                                            <Textarea
                                                disabled={isSubmitting || isLoading}
                                                placeholder="Enter affiliation description"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                disabled={isSubmitting || isLoading}
                                type="submit"
                            >
                                {getButtonText()}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}