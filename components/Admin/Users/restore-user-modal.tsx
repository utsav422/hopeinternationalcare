'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';
import {
    ZodUserRestorationSchema,
    type ZodUserRestorationType,
} from '@/lib/db/drizzle-zod-schema';

interface RestoreUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        full_name: string;
        email: string;
        deletion_count?: number;
        deleted_at: string | null;
    } | null;
    onRestore: (data: ZodUserRestorationType) => Promise<void>;
}

const MAX_RESTORATIONS = parseInt(
    process.env.NEXT_PUBLIC_MAX_USER_RESTORATIONS || '3'
);

export default function RestoreUserModal({
    isOpen,
    onClose,
    user,
    onRestore,
}: RestoreUserModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ZodUserRestorationType>({
        resolver: zodResolver(ZodUserRestorationSchema),
        defaultValues: {
            user_id: user?.id || '',
            restoration_reason: '',
        },
    });

    const handleSubmit = async (data: ZodUserRestorationType) => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            await onRestore({
                ...data,
                user_id: user.id,
            });
            form.reset();
            onClose();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to restore user'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    if (!user) return null;

    const deletionCount = user.deletion_count || 0;
    const remainingRestorations = MAX_RESTORATIONS - deletionCount;
    const canRestore = remainingRestorations > 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600">
                        <UserCheck className="h-5 w-5" />
                        Restore User Account
                    </DialogTitle>
                    <DialogDescription>
                        This action will reactivate the user account and restore
                        full access.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <UserCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-800">
                                User Information
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                                <strong>Name:</strong> {user.full_name}
                            </p>
                            <p className="text-sm text-blue-700">
                                <strong>Email:</strong> {user.email}
                            </p>
                            <p className="text-sm text-blue-700">
                                <strong>Deleted:</strong>{' '}
                                {user.deleted_at
                                    ? new Date(user.deleted_at).toLocaleString(
                                          'en-US',
                                          { timeZone: 'Asia/Kathmandu' }
                                      )
                                    : 'Unknown'}
                            </p>
                            <p className="text-sm text-blue-700">
                                <strong>Previous Deletions:</strong>{' '}
                                {deletionCount}
                            </p>
                            <p className="text-sm text-blue-700">
                                <strong>Remaining Restorations:</strong>{' '}
                                {remainingRestorations}
                            </p>
                        </div>
                    </div>
                </div>

                {!canRestore && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-red-800">
                                    Restoration Limit Reached
                                </h4>
                                <p className="text-sm text-red-700 mt-1">
                                    This user has reached the maximum
                                    restoration limit of {MAX_RESTORATIONS}.
                                    Contact system administrator for special
                                    approval.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {canRestore && (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="restoration_reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-medium">
                                            Restoration Reason *
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Please provide a reason for restoring this user account (minimum 5 characters)"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This reason will be included in the
                                            notification email and audit logs.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <RefreshCw className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-green-800">
                                            What Will Happen
                                        </h4>
                                        <ul className="text-sm text-green-700 mt-2 space-y-1">
                                            <li>
                                                • User will regain full access
                                                to their account
                                            </li>
                                            <li>
                                                • All account features will be
                                                restored
                                            </li>
                                            <li>
                                                • User will receive a
                                                confirmation email
                                            </li>
                                            <li>
                                                • Restoration will be logged for
                                                audit purposes
                                            </li>
                                            <li>
                                                • User can immediately sign in
                                                and use the platform
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {remainingRestorations <= 2 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-yellow-800">
                                                Restoration Limit Warning
                                            </h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                This user has only{' '}
                                                {remainingRestorations}{' '}
                                                restoration
                                                {remainingRestorations !== 1
                                                    ? 's'
                                                    : ''}{' '}
                                                remaining. Please ensure this
                                                restoration is necessary.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={isSubmitting}
                                    className="min-w-[120px] bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Restoring...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            Restore User
                                        </div>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}

                {!canRestore && (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
