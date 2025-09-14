'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {InviteUserSchema, type ZInviteUserType,} from '@/lib/db/drizzle-zod-schema/users';
import {inviteUserAction} from '@/lib/server-actions/admin/admin-auth-actions';
import {useRouter} from "next/navigation";

export default function InviteUserForm({onFinishCallback}: { onFinishCallback: Function }) {
    const router = useRouter();
    const form = useForm<ZInviteUserType>({
        resolver: zodResolver(InviteUserSchema),
        defaultValues: {
            email: '',
            phone: '',
            full_name: '',
        },
    });
    const handleSubmit = form.handleSubmit;
    const onSubmit: SubmitHandler<ZInviteUserType> = async (validInputs) => {
        const formData = new FormData();
        formData.append('email', validInputs.email);

        // Only append a phone if it's not empty
        if (validInputs.phone && validInputs.phone.trim() !== '') {
            formData.append('phone', validInputs.phone);
        }

        // Only append full_name if it's not empty
        if (validInputs.full_name && validInputs.full_name.trim() !== '') {
            formData.append('full_name', validInputs.full_name);
        }
        toast.promise(inviteUserAction(formData), {
            loading: 'Sending invite...',
            success: (result: { success: boolean; message: string }) => {
                if (result?.success && result?.message) {
                    onFinishCallback && onFinishCallback()
                    router.replace('/admin/users', undefined);
                    toast.success(
                        `Invite sent successfully to ${validInputs.email}`
                    )
                    form.reset();
                    return result?.message;
                }
                if (result?.message) {
                    throw new Error(result?.message);
                }
                throw new Error('Failed to send invite');
            },
            error: (error: Error) => {
                return error.message || 'Failed to send invite';
            },
        });
    };


    return (<>

            <Form {...form}>
                <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                <div className="space-y-1 md:col-span-1">
                                    <FormLabel className="font-medium text-sm leading-none ">
                                        Email
                                    </FormLabel>
                                </div>
                                {' '}
                                <div className="space-y-2 md:col-span-3">
                                    <FormControl>
                                        <Input
                                            placeholder="Enter user email to invite"
                                            required
                                            type="email"
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                        />
                                    </FormControl>

                                    <FormMessage/>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                <div className="space-y-1 md:col-span-1">
                                    <FormLabel className="font-medium text-sm leading-none ">
                                        Full name
                                    </FormLabel>
                                </div>
                                {' '}
                                <div className="space-y-2 md:col-span-3">
                                    <FormControl>
                                        <Input
                                            id="full_name"
                                            placeholder="Enter user full name to invite"
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                        />
                                    </FormControl>

                                    <FormMessage/>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                                <div className="space-y-1 md:col-span-1">
                                    <FormLabel className="font-medium text-sm leading-none ">
                                        Phone number
                                    </FormLabel>
                                </div>
                                {' '}
                                <div className="space-y-2 md:col-span-3">
                                    <FormControl className="w-full">
                                        <Input
                                            id="phone"
                                            placeholder="Enter user phone to invite"
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                        />
                                    </FormControl>

                                    <FormMessage/>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormItem className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                        <div className="space-y-1 md:col-span-2">
                            <FormLabel className="font-medium text-sm leading-none ">
                                Action{' '}
                            </FormLabel>{' '}
                            <FormDescription className="text-muted-foreground text-xs ">
                                Submit Action For Invite
                            </FormDescription>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Button
                                disabled={form.formState.isSubmitting}
                                type="submit"
                            >
                                {form.formState.isSubmitting ? (
                                    <span>Submitting...</span>
                                ) : (
                                    <span>Send Invite</span>
                                )}
                            </Button>{' '}
                        </div>
                    </FormItem>
                </form>
            </Form>{' '}

        </>
    );
}
