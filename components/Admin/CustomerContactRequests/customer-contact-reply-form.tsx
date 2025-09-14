'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Send, Users } from 'lucide-react';
import { CustomerContactReplySchema, CustomerContactBatchReplySchema } from '@/lib/db/drizzle-zod-schema/customer-contact-replies';
import type { CustomerContactReplyType, CustomerContactBatchReplyType } from '@/lib/db/drizzle-zod-schema/customer-contact-replies';
import type { ZodCustomerContactRequestSelectType } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import { useCustomerContactReply, useCustomerContactBatchReply } from '@/hooks/admin/customer-contact-reply';
import { format } from 'date-fns';

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
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

    const singleReplyMutation = useCustomerContactReply();
    const batchReplyMutation = useCustomerContactBatchReply();

    const isSingleMode = mode === 'single';
    const schema = isSingleMode ? CustomerContactReplySchema : CustomerContactBatchReplySchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CustomerContactReplyType | CustomerContactBatchReplyType>({
        resolver: zodResolver(schema),
        defaultValues: isSingleMode && contactRequest ? {
            contactRequestId: contactRequest.id,
            replyToEmail: contactRequest.email,
            replyToName: contactRequest.name,
            subject: `Your inquiry about Hope International`,
            message: '',
        } : {
            contactRequestIds: contactRequests.map(req => req.id),
            subject: 'Thank you for contacting Hope International',
            message: '',
        },
    });

    const onSubmit = async (data: CustomerContactReplyType | CustomerContactBatchReplyType) => {
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            if (isSingleMode) {
                const result = await singleReplyMutation.mutateAsync(data as CustomerContactReplyType);
                if (result.success) {
                    setSubmitResult({
                        success: true,
                        message: `Reply sent successfully to ${(data as CustomerContactReplyType).replyToEmail}`,
                    });
                    reset();
                    onSuccess?.();
                } else {
                    setSubmitResult({
                        success: false,
                        message: result.error || 'Failed to send reply',
                    });
                }
            } else {
                const result = await batchReplyMutation.mutateAsync(data as CustomerContactBatchReplyType);
                if (result.success && result.data) {
                    const { totalSent = 0, totalFailed = 0 } = result.data;
                    setSubmitResult({
                        success: true,
                        message: `Batch reply completed: ${totalSent} sent successfully${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`,
                    });
                    reset();
                    onSuccess?.();
                } else {
                    setSubmitResult({
                        success: false,
                        message: result.error || 'Failed to send batch reply',
                    });
                }
            }
        } catch (error) {
            setSubmitResult({
                success: false,
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {isSingleMode ? <Mail className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                    {isSingleMode ? 'Reply to Customer Contact Request' : 'Send Batch Reply'}
                </CardTitle>
                <CardDescription>
                    {isSingleMode
                        ? 'Send a personalized reply to the customer inquiry'
                        : `Send a reply to ${contactRequests.length} customer contact requests`
                    }
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Display contact request details */}
                {isSingleMode && contactRequest && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Original Contact Request</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{contactRequest.name}</p>
                                    <p className="text-sm text-gray-600">{contactRequest.email}</p>
                                    {contactRequest.phone && (
                                        <p className="text-sm text-gray-600">{contactRequest.phone}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <Badge variant={contactRequest.status === 'pending' ? 'destructive' : 'secondary'}>
                                        {contactRequest.status}
                                    </Badge>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {format(new Date(contactRequest.created_at), 'PPP')}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Message:</p>
                                <p className="text-sm text-gray-600 mt-1">{contactRequest.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Display batch contact requests summary */}
                {!isSingleMode && contactRequests.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Recipients ({contactRequests.length})</h3>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                            <div className="space-y-2">
                                {contactRequests.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="font-medium">{req.name}</span>
                                            <span className="text-gray-600 ml-2">{req.email}</span>
                                        </div>
                                        <Badge variant={req.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs">
                                            {req.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <Separator />

                {/* Reply form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {isSingleMode && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="replyToName">Recipient Name</Label>
                                    <Input
                                        id="replyToName"
                                        {...register('replyToName' as keyof CustomerContactReplyType)}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    {isSingleMode && 'replyToName' in errors && errors.replyToName && (
                                        <p className="text-sm text-red-600">{errors.replyToName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="replyToEmail">Recipient Email</Label>
                                    <Input
                                        id="replyToEmail"
                                        type="email"
                                        {...register('replyToEmail' as keyof CustomerContactReplyType)}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    {isSingleMode && 'replyToEmail' in errors && errors.replyToEmail && (
                                        <p className="text-sm text-red-600">{errors.replyToEmail.message}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            {...register('subject')}
                            placeholder="Enter email subject"
                        />
                        {errors.subject && (
                            <p className="text-sm text-red-600">{errors.subject.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            {...register('message')}
                            placeholder="Enter your reply message..."
                            rows={8}
                            className="resize-none"
                        />
                        {errors.message && (
                            <p className="text-sm text-red-600">{errors.message.message}</p>
                        )}
                    </div>

                    {submitResult && (
                        <Alert variant={submitResult.success ? 'default' : 'destructive'}>
                            <AlertDescription>{submitResult.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onCancel}>
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
                                    {isSingleMode ? 'Send Reply' : `Send to ${contactRequests.length} Recipients`}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
