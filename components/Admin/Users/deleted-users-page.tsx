'use client';

import { useState } from 'react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Calendar,
    MoreHorizontal,
    RefreshCw,
    Trash2,
    UserX,
} from 'lucide-react';
import Link from 'next/link';
import RestoreUserModal from './restore-user-modal';
import UserDeletionHistory from './user-deletion-history';
// import {
//     useDeletedUsers,
//     useDeletionStatistics,
// } from '@/hooks/admin/user-deletion';
import { DataTable } from '@/components/Custom/data-table';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';

interface DeletedUser {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    deleted_at: string | null;
    deletion_scheduled_for: string | null;
    deletion_count: number;
    deletion_reason: string | null;
    deleted_by?: string;
    email_notification_sent: boolean | null;
}

interface DeletedUsersPageProps {
    initialUsers: DeletedUser[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}

export default function DeletedUsersPage() {
    const [selectedUser, setSelectedUser] = useState<DeletedUser | null>(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Use URL-synced query state for a data table
    const { page, sortBy, order, pageSize, filters } = useDataTableQueryState();

    // Derive 'search' value from filters (support filtering by email or full_name)
    const search =
        (filters?.find((f: any) => f.id === 'email')?.value as string) ??
        (filters?.find((f: any) => f.id === 'full_name')?.value as string) ??
        '';

    // const { data: deletedUsersData } = useDeletedUsers({
    //     page,
    //     pageSize,
    //     search,
    //     sortBy,
    //     order,
    // } as any);

    const users = [] as any[]; // deletedUsersData?.users || [];
    const totalCount = 0; // deletedUsersData?.pagination?.total || 0;

    const handleRestore = async (data: {
        user_id: string;
        restoration_reason: string;
    }) => {
        try {
            const formData = new FormData();
            formData.append('user_id', data.user_id);
            formData.append('restoration_reason', data.restoration_reason);

            // Call restore user action
            const response = await fetch('/api/admin/users/restore', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast.success('User restored successfully');

                setShowRestoreModal(false);
                setSelectedUser(null);
            } else {
                toast.error(result.message || 'Failed to restore user');
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to restore user'
            );
            // throw error;
        }
    };

    const handleViewHistory = (user: DeletedUser) => {
        setSelectedUser(user);
        setShowHistoryModal(true);
    };

    const handleRestoreClick = (user: DeletedUser) => {
        setSelectedUser(user);
        setShowRestoreModal(true);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Date is not available';
        return new Date(dateString).toLocaleString('en-US', {
            timeZone: 'Asia/Kathmandu',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDeletionStatus = (user: DeletedUser) => {
        if (user.deletion_scheduled_for) {
            const scheduledDate = new Date(user.deletion_scheduled_for);
            const now = new Date();
            if (scheduledDate > now) {
                return {
                    status: 'scheduled',
                    label: 'Scheduled',
                    variant: 'secondary' as const,
                };
            }
        }
        return {
            status: 'deleted',
            label: 'Deleted',
            variant: 'destructive' as const,
        };
    };

    // Define columns for the DataTable
    const columns: ColumnDef<DeletedUser>[] = [
        {
            accessorKey: 'full_name',
            header: () => <div>User</div>,
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.email}
                    </div>
                </div>
            ),
        },
        {
            id: 'status',
            header: () => <div>Status</div>,
            cell: ({ row }) => {
                const status = getDeletionStatus(row.original);
                return <Badge variant={status.variant}>{status.label}</Badge>;
            },
            enableSorting: false,
            enableHiding: true,
        },
        {
            accessorKey: 'deleted_at',
            header: () => <div>Deleted Date</div>,
            cell: ({ row }: { row: Row<DeletedUser> }) => (
                <div className="text-sm">
                    {formatDate(row.original.deleted_at)}
                    {row.original.deletion_scheduled_for && (
                        <div className="text-xs text-muted-foreground">
                            Scheduled:{' '}
                            {formatDate(row.original.deletion_scheduled_for)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'deletion_count',
            header: () => <div>Deletion Count</div>,
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.deletion_count}</Badge>
            ),
        },
        {
            accessorKey: 'deletion_reason',
            header: () => <div>Reason</div>,
            cell: ({ row }) => (
                <div className="max-w-xs truncate text-sm">
                    {row.original.deletion_reason || 'No reason provided'}
                </div>
            ),
            enableHiding: true,
        },
        {
            id: 'action',
            header: () => <div>Actions</div>,
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => handleRestoreClick(row.original)}
                            className="text-green-600"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restore User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {/*<History className="h-4 w-4 mr-2" />*/}
                            <UserDeletionHistory
                                userId={selectedUser?.id || ''}
                            />
                            {/*View History*/}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserX className="h-6 w-6" />
                        Deleted Users - this page is deprecated
                    </h1>
                    <p className="text-muted-foreground">
                        Manage deleted user accounts and restoration
                    </p>
                </div>
                <Link href="/admin/users">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Users
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Deleted
                        </CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Scheduled Deletions
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => u.deletion_scheduled_for).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Immediate Deletions
                        </CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                users.filter(u => !u.deletion_scheduled_for)
                                    .length
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Deleted Users List</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable<DeletedUser, unknown>
                        columns={columns}
                        data={users}
                        title=""
                        total={totalCount}
                    />
                </CardContent>
            </Card>

            {/* Modals */}
            <RestoreUserModal
                isOpen={showRestoreModal}
                onClose={() => {
                    setShowRestoreModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onRestore={handleRestore}
            />
        </div>
    );
}
