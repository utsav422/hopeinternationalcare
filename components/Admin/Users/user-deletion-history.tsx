'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Clock,
    History,
    Mail,
    RefreshCw,
    Trash2,
} from 'lucide-react';

interface DeletionHistoryEntry {
    id: string;
    deleted_at: string;
    restored_at?: string;
    deletion_reason: string;
    scheduled_deletion_date?: string;
    email_notification_sent: boolean;
    restoration_count: number;
    created_at: string;
}

interface UserDeletionHistoryProps {
    userId: string;
}

export default function UserDeletionHistory({
    userId,
}: UserDeletionHistoryProps) {
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState<DeletionHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/admin/users/${userId}/deletion-history`
            );
            const result = await response.json();

            if (result.success) {
                setHistory(result.data.history || []);
            } else {
                throw new Error(result.message || 'Failed to fetch history');
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch deletion history'
            );
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (open && userId) {
            fetchHistory();
        }
    }, [open, fetchHistory, userId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            timeZone: 'Asia/Kathmandu',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (entry: DeletionHistoryEntry) => {
        if (entry.restored_at) {
            return (
                <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                >
                    Restored
                </Badge>
            );
        }
        if (entry.scheduled_deletion_date) {
            const scheduledDate = new Date(entry.scheduled_deletion_date);
            const now = new Date();
            if (scheduledDate > now) {
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                    >
                        Scheduled
                    </Badge>
                );
            }
        }
        return <Badge variant="destructive">Deleted</Badge>;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm hover:bg-muted/80">
                    <History className="h-4 w-4" />
                    View Deletion History
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        User Deletion History
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                Loading history...
                            </div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8">
                            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">
                                No deletion history found
                            </h3>
                            <p className="text-muted-foreground">
                                This user has no deletion or restoration
                                history.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {history.map((entry, index) => (
                                <div key={entry.id} className="relative">
                                    {/* Timeline line */}
                                    {index < history.length - 1 && (
                                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                                    )}

                                    <div className="flex gap-4">
                                        {/* Timeline icon */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center">
                                                {entry.restored_at ? (
                                                    <RefreshCw className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Trash2 className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-card border rounded-lg p-4">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">
                                                            {entry.restored_at
                                                                ? 'Account Restored'
                                                                : 'Account Deleted'}
                                                        </h4>
                                                        {getStatusBadge(entry)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(
                                                            entry.created_at
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Deletion Details */}
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                Deleted:
                                                            </span>
                                                            <span>
                                                                {formatDate(
                                                                    entry.deleted_at
                                                                )}
                                                            </span>
                                                        </div>
                                                        {/*<div className="flex items-center gap-2 text-sm">*/}
                                                        {/*    <User className="h-4 w-4 text-muted-foreground" />*/}
                                                        {/*    <span className="font-medium">Deleted by:</span>*/}
                                                        {/*    <span>{entry.deleted_by}</span>*/}
                                                        {/*</div>*/}
                                                    </div>

                                                    {entry.scheduled_deletion_date && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                Scheduled for:
                                                            </span>
                                                            <span>
                                                                {formatDate(
                                                                    entry.scheduled_deletion_date
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            Email sent:
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                entry.email_notification_sent
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {entry.email_notification_sent
                                                                ? 'Yes'
                                                                : 'No'}
                                                        </Badge>
                                                    </div>

                                                    <div>
                                                        <span className="font-medium text-sm">
                                                            Deletion Reason:
                                                        </span>
                                                        <p className="text-sm text-muted-foreground mt-1 bg-muted p-2 rounded">
                                                            {
                                                                entry.deletion_reason
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Restoration Details */}
                                                    {entry.restored_at && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-2">
                                                                <h5 className="font-medium text-green-700 flex items-center gap-2">
                                                                    <RefreshCw className="h-4 w-4" />
                                                                    Restoration
                                                                    Details
                                                                </h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="font-medium">
                                                                            Restored:
                                                                        </span>
                                                                        <span>
                                                                            {formatDate(
                                                                                entry.restored_at
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    {/*<div className="flex items-center gap-2 text-sm">*/}
                                                                    {/*    <User className="h-4 w-4 text-muted-foreground" />*/}
                                                                    {/*    <span className="font-medium">Restored by:</span>*/}
                                                                    {/*    <span>{entry.restored_by || 'Unknown'}</span>*/}
                                                                    {/*</div>*/}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-medium">
                                                                        Restoration
                                                                        count:
                                                                    </span>
                                                                    <Badge variant="outline">
                                                                        {
                                                                            entry.restoration_count
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
