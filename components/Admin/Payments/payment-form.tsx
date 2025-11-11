'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import EnrollmentSelect from '@/components/Custom/enrollment-select';
import FormSkeleton from '@/components/Custom/form-skeleton';
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
import {
    useAdminPaymentDetails,
    useAdminPaymentCreate,
    useAdminPaymentUpdate,
} from '@/hooks/admin/payments-optimized';
import type { EnrollmentListItem } from '@/lib/types/enrollments';
import {
    ZodPaymentInsertSchema,
    type ZodInsertPaymentType,
} from '@/lib/db/drizzle-zod-schema/payments';
import { PaymentMethod, PaymentStatus } from '@/lib/db/schema/enums';
import { useEffect } from 'react';

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
    } = useAdminPaymentDetails(id ?? '');

    const initialData = queryResult?.data;

    const createPaymentMutation = useAdminPaymentCreate();
    const updatePaymentMutation = useAdminPaymentUpdate();

    const form = useForm<ZodInsertPaymentType>({
        resolver: zodResolver(ZodPaymentInsertSchema),
        defaultValues: {
            enrollment_id: '',
            amount: 0,
            method: PaymentMethod.cash,
            status: PaymentStatus.pending,
            remarks: '',
            paid_at: new Date().toISOString().substring(0, 10),
        },
    });

    useEffect(() => {
        if (initialData?.payment) {
            form.reset({
                ...initialData.payment,
                paid_at: initialData.payment.paid_at
                    ? new Date(initialData.payment.paid_at)
                          .toISOString()
                          .substring(0, 10)
                    : '',
            });
        }
    }, [initialData, form]);

    const { isSubmitting } = form.formState;

    const onSubmit = async (values: ZodInsertPaymentType) => {
        try {
            const mutation = id
                ? updatePaymentMutation.mutateAsync({ ...values, id })
                : createPaymentMutation.mutateAsync(values);

            await toast.promise(mutation, {
                loading: 'Saving payment...',
                success: () => {
                    router.push('/admin/payments');
                    return `Payment ${
                        id ? 'updated' : 'created'
                    } successfully.`;
                },
                error: 'Failed to save payment.',
            });
        } catch (err) {
            toast.error(
                (err as Error).message || 'An unexpected error occurred.'
            );
        }
    };

    const getButtonText = () => {
        if (isSubmitting) {
            return 'Saving...';
        }
        if (id) {
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
        return <FormSkeleton />;
    }
    return (
        <Card className="">
            <CardHeader>
                <div className="mb-6 space-y-1">
                    <h3 className="font-medium text-lg ">{formTitle}</h3>
                    <p className="text-muted-foreground text-sm ">
                        Fill in the information about the payment.
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
                            name="enrollment_id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="">
                                            Enrollment
                                        </FormLabel>
                                        <FormDescription className="text-xs ">
                                            Select the student enrollment.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <FormControl>
                                            <EnrollmentSelect
                                                field={field}
                                                getItemOnValueChanges={(
                                                    item: EnrollmentListItem
                                                ) => {
                                                    form.setValue(
                                                        'amount',
                                                        item.course.price || 0
                                                    );
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
                                        <FormLabel className="">
                                            Amount
                                        </FormLabel>
                                        <FormDescription className="text-xs ">
                                            Amount is set from the course price.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e =>
                                                    field.onChange(
                                                        e.target.value === ''
                                                            ? null
                                                            : e.target
                                                                  .valueAsNumber
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
                            name="method"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                    <div className="space-y-1 md:col-span-1">
                                        <FormLabel className="">
                                            Payment Method
                                        </FormLabel>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? undefined}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a payment method" />
                                                </SelectTrigger>
                                                <SelectContent className="capitalize ">
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Payment Method
                                                        </SelectLabel>
                                                        {Object.values(
                                                            PaymentMethod
                                                        ).map(
                                                            (
                                                                method: string
                                                            ) => (
                                                                <SelectItem
                                                                    key={method}
                                                                    value={
                                                                        method
                                                                    }
                                                                >
                                                                    {method}
                                                                </SelectItem>
                                                            )
                                                        )}
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
                                        <FormLabel className="">
                                            Payment Status
                                        </FormLabel>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? undefined}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a payment status" />
                                                </SelectTrigger>
                                                <SelectContent className="capitalize ">
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Payment Status
                                                        </SelectLabel>
                                                        {Object.values(
                                                            PaymentStatus
                                                        ).map(status => (
                                                            <SelectItem
                                                                className="capitalize "
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
                                        <FormLabel className="">
                                            Remarks
                                        </FormLabel>
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <FormControl>
                                            <Input
                                                {...field}
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
