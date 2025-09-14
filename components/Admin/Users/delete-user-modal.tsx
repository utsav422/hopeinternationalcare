'use client';

import { useUserDeletionForm } from '@/hooks/admin/use-user-deletion-forms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Calendar, Clock, Mail, Trash2 } from 'lucide-react';
import { ZodUserDeletionSchema, type ZodUserDeletionType } from '@/lib/db/drizzle-zod-schema';
import { z } from 'zod';

// Create a form-specific schema that makes send_email_notification required
const FormUserDeletionSchema = z.object({
    user_id: z.string().uuid(),
    deletion_reason: z.string().min(10, 'Deletion reason must be at least 10 characters').max(500, 'Deletion reason cannot exceed 500 characters'),
    scheduled_deletion_date: z.string().datetime().optional(),
    send_email_notification: z.boolean(),
});

type FormUserDeletionType = z.infer<typeof FormUserDeletionSchema>;

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        full_name: string;
        email: string;
    } | null;
    onDelete: (data: FormUserDeletionType) => Promise<void>;
}

export default function DeleteUserModal({ isOpen, onClose, user, onDelete }: DeleteUserModalProps) {
    const {
        form,
        isScheduled,
        isSubmitting,
        handleSubmit,
        handleScheduledToggle,
        resetForm,
        getDefaultScheduledDate,
    } = useUserDeletionForm(user);

    const handleFormSubmit = async (data: FormUserDeletionType) => {
        const result = await handleSubmit(data);
        if (result?.success) {
            onClose();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Delete User Account
                    </DialogTitle>
                    <DialogDescription>
                        This action will deactivate the user account. Please provide a reason and choose deletion timing.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-red-800">User Information</h4>
                            <p className="text-sm text-red-700 mt-1">
                                <strong>Name:</strong> {user.full_name}
                            </p>
                            <p className="text-sm text-red-700">
                                <strong>Email:</strong> {user.email}
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="deletion_reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">
                                        Deletion Reason *
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please provide a detailed reason for deleting this user account (minimum 10 characters)"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This reason will be included in the notification email and audit logs.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="scheduled"
                                    checked={isScheduled}
                                    onCheckedChange={(checked) => handleScheduledToggle(checked === true)}
                                />
                                <label
                                    htmlFor="scheduled"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Schedule deletion for later
                                </label>
                            </div>

                            {isScheduled && (
                                <FormField
                                    control={form.control}
                                    name="scheduled_deletion_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Scheduled Deletion Date & Time
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    min={getDefaultScheduledDate()}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Time zone: Nepal Standard Time (NPT). Maximum 30 days from now.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="send_email_notification"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Send email notification to user
                                        </FormLabel>
                                        <FormDescription>
                                            The user will receive an email notification about the account deletion.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-800">Important Notice</h4>
                                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                                        <li>• The user will immediately lose access to their account</li>
                                        <li>• All active enrollments will be cancelled</li>
                                        <li>• This action can be reversed by administrators</li>
                                        <li>• All deletion activities are logged for audit purposes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

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
                                variant="destructive"
                                disabled={isSubmitting}
                                className="min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Processing...
                                    </div>
                                ) : isScheduled ? (
                                    'Schedule Deletion'
                                ) : (
                                    'Delete Now'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
