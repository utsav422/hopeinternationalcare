'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Send, Users } from 'lucide-react';
import {
    CustomerContactReplySchema,
    CustomerContactBatchReplySchema,
    ZodCustomerContactReplySelectSchema,
    ZodCustomerContactReplyInsertSchema,
} from '@/lib/db/drizzle-zod-schema/customer-contact-replies';
import type {
    CustomerContactReplyType,
    CustomerContactBatchReplyType,
    ZodCustomerContactReplyInsertType,
} from '@/lib/db/drizzle-zod-schema/customer-contact-replies';
import type { ZodCustomerContactRequestSelectType } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import {
    useAdminCustomerContactReplyCreate,
    useAdminCustomerContactReplyBatchReply,
} from '@/hooks/admin/customer-contact-replies-optimized';
import { format } from 'date-fns';
import {
    CustomerContactReplyCreateData,
    CustomerContactReplyInsert,
} from '@/lib/types';

interface CustomerContactReplyFormProps {
    contactRequest?: ZodCustomerContactRequestSelectType;
    contactRequests?: ZodCustomerContactRequestSelectType[];
    mode: 'single' | 'batch';
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CustomerContactReplyForm({
    contactRequest,
    contactRequests = [],
    mode,
    onSuccess,
    onCancel,
}: CustomerContactReplyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const singleReplyMutation = useAdminCustomerContactReplyCreate();
    const batchReplyMutation = useAdminCustomerContactReplyBatchReply();

    const isSingleMode = mode === 'single';
    // Separate form hooks for single and batch modes to avoid union type issues
    const singleForm = useForm({
        resolver: zodResolver(ZodCustomerContactReplyInsertSchema),
        defaultValues: contactRequest
            ? {
                  email_status: 'opened',
                  admin_id: '',
                  admin_email: '',
                  contact_request_id: contactRequest.id,
                  reply_to_email: contactRequest.email,
                  reply_to_name: contactRequest.name,
                  subject: `Your inquiry about Hope International`,
                  message: '',
              }
            : undefined,
    });

    const batchForm = useForm<CustomerContactBatchReplyType>({
        resolver: zodResolver(CustomerContactBatchReplySchema),
        defaultValues: {
            contactRequestIds: contactRequests.map(req => req.id),
            subject: 'Thank you for contacting Hope International',
            message: '',
        },
    });

    const onSubmitSingle = async (data: ZodCustomerContactReplyInsertType) => {
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const result = await singleReplyMutation.mutateAsync(data);
            if (result.success) {
                setSubmitResult({
                    success: true,
                    message: `Reply sent successfully to ${data.reply_to_email}`,
                });
                singleForm.reset();
                onSuccess?.();
            } else {
                setSubmitResult({
                    success: false,
                    message: result.error || 'Failed to send reply',
                });
            }
        } catch (error) {
            setSubmitResult({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitBatch = async (data: CustomerContactBatchReplyType) => {
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const result = await batchReplyMutation.mutateAsync(data);
            if (result.success && result.data) {
                const { totalSent = 0, totalFailed = 0 } = result.data;
                setSubmitResult({
                    success: true,
                    message: `Batch reply completed: ${totalSent} sent successfully${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`,
                });
                batchForm.reset();
                onSuccess?.();
            } else {
                setSubmitResult({
                    success: false,
                    message: result.error || 'Failed to send batch reply',
                });
            }
        } catch (error) {
            setSubmitResult({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isSingleMode ? (
                        <Mail className="h-5 w-5" />
                    ) : (
                        <Users className="h-5 w-5" />
                    )}
                    {isSingleMode
                        ? 'Reply to Customer Contact Request'
                        : 'Send Batch Reply'}
                </CardTitle>
                <CardDescription>
                    {isSingleMode
                        ? 'Send a personalized reply to the customer inquiry'
                        : `Send a reply to ${contactRequests.length} customer contact requests`}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Display contact request details */}
                {isSingleMode && contactRequest && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Original Contact Request
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">
                                        {contactRequest.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {contactRequest.email}
                                    </p>
                                    {contactRequest.phone && (
                                        <p className="text-sm text-gray-600">
                                            {contactRequest.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <Badge
                                        variant={
                                            contactRequest.status === 'pending'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                    >
                                        {contactRequest.status}
                                    </Badge>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {format(
                                            new Date(contactRequest.created_at),
                                            'PPP'
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Message:
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {contactRequest.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Display batch contact requests summary */}
                {!isSingleMode && contactRequests.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Recipients ({contactRequests.length})
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                            <div className="space-y-2">
                                {contactRequests.map(req => (
                                    <div
                                        key={req.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {req.name}
                                            </span>
                                            <span className="text-gray-600 ml-2">
                                                {req.email}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={
                                                req.status === 'pending'
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                            className="text-xs"
                                        >
                                            {req.status}
                                        </Badge>
                                        {/* {...register('reply_to_name')} */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <Separator />

                {/* Reply form */}
                <form
                    onSubmit={() => {
                        alert('Your form is being submitted...');
                        isSingleMode
                            ? singleForm.handleSubmit(
                                  onSubmitSingle,
                                  console.log
                              )
                            : batchForm.handleSubmit(
                                  onSubmitBatch,
                                  console.log
                              );
                    }}
                    className="space-y-4"
                >
                    {isSingleMode && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reply_to_name">
                                        Recipient Name
                                    </Label>
                                    <Input
                                        id="reply_to_name"
                                        {...singleForm.register(
                                            'reply_to_name'
                                        )}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    {'reply_to_name' in
                                        singleForm.formState.errors &&
                                        singleForm.formState.errors
                                            .reply_to_name && (
                                            <p className="text-sm text-red-600">
                                                {
                                                    singleForm.formState.errors
                                                        .reply_to_name.message
                                                }
                                            </p>
                                        )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reply_to_email">
                                        Recipient Email
                                    </Label>
                                    <Input
                                        id="reply_to_email"
                                        type="email"
                                        {...singleForm.register(
                                            'reply_to_email'
                                        )}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    {'reply_to_email' in
                                        singleForm.formState.errors &&
                                        singleForm.formState.errors
                                            .reply_to_email && (
                                            <p className="text-sm text-red-600">
                                                {
                                                    singleForm.formState.errors
                                                        .reply_to_email.message
                                                }
                                            </p>
                                        )}
                                </div>
                            </div>
                        </>
                    )}

                    {!isSingleMode && (
                        <>
                            {/* Batch mode does not have reply_to_name or reply_to_email fields */}
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            {...(isSingleMode
                                ? singleForm.register('subject')
                                : batchForm.register('subject'))}
                            placeholder="Enter email subject"
                        />
                        {(isSingleMode
                            ? singleForm.formState.errors.subject
                            : batchForm.formState.errors.subject) && (
                            <p className="text-sm text-red-600">
                                {isSingleMode
                                    ? singleForm.formState.errors.subject
                                          ?.message
                                    : batchForm.formState.errors.subject
                                          ?.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            {...(isSingleMode
                                ? singleForm.register('message')
                                : batchForm.register('message'))}
                            placeholder="Enter your reply message..."
                            rows={8}
                            className="resize-none"
                        />
                        {(isSingleMode
                            ? singleForm.formState.errors.message
                            : batchForm.formState.errors.message) && (
                            <p className="text-sm text-red-600">
                                {isSingleMode
                                    ? singleForm.formState.errors.message
                                          ?.message
                                    : batchForm.formState.errors.message
                                          ?.message}
                            </p>
                        )}
                    </div>
                    {/* )} */}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onCancel && onCancel()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    {isSingleMode
                                        ? 'Send Reply'
                                        : `Send to ${contactRequests.length} Recipients`}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
