'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Calendar,
    Filter,
    History,
    MoreHorizontal,
    RefreshCw,
    Search,
    Trash2,
    UserX
} from 'lucide-react';
import Link from 'next/link';
import RestoreUserModal from './restore-user-modal';
import UserDeletionHistory from './user-deletion-history';
import UserManagementBreadcrumb, { UserManagementQuickNav } from './user-management-breadcrumb';
import { useDeletedUsers, useDeletionStatistics } from '@/hooks/admin/user-deletion';
import { useDeletionFilters } from '@/hooks/admin/use-user-deletion-forms';

interface DeletedUser {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    deleted_at: string;
    deletion_scheduled_for?: string;
    deletion_count: number;
    deletion_reason?: string;
    deleted_by?: string;
    email_notification_sent?: boolean;
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

    // Use custom hooks for data management
    const { filters, updateFilter, resetFilters, hasActiveFilters } = useDeletionFilters();

    const { data: deletedUsersData, isLoading, error } = useDeletedUsers(filters);
    const { data: statistics } = useDeletionStatistics();

    const users = deletedUsersData?.users || [];
    const totalCount = deletedUsersData?.pagination?.total || 0;

    const handleRestore = async (data: { user_id: string; restoration_reason: string }) => {
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
            toast.error(error instanceof Error ? error.message : 'Failed to restore user');
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

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
    ) as DeletedUser[];

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

    const getDeletionStatus = (user: DeletedUser) => {
        if (user.deletion_scheduled_for) {
            const scheduledDate = new Date(user.deletion_scheduled_for);
            const now = new Date();
            if (scheduledDate > now) {
                return { status: 'scheduled', label: 'Scheduled', variant: 'secondary' as const };
            }
        }
        return { status: 'deleted', label: 'Deleted', variant: 'destructive' as const };
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            <UserManagementBreadcrumb />

            {/* Quick Navigation */}
            <UserManagementQuickNav />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <UserX className="h-6 w-6" />
                            Deleted Users
                        </h1>
                        <p className="text-muted-foreground">
                            Manage deleted user accounts and restoration
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deleted</CardTitle>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled Deletions</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Immediate Deletions</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => !u.deletion_scheduled_for).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Deleted Users List</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={filters.search}
                                    onChange={(e) => updateFilter('search',e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Deleted Date</TableHead>
                                <TableHead>Deletion Count</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>

                            {filteredUsers.map((user) => {
                                const status = getDeletionStatus(user);
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{user.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant}>
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {formatDate(user.deleted_at)}
                                            </div>
                                            {user.deletion_scheduled_for && (
                                                <div className="text-xs text-muted-foreground">
                                                    Scheduled: {formatDate(user.deletion_scheduled_for)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {user.deletion_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs truncate text-sm">
                                                {user.deletion_reason || 'No reason provided'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleRestoreClick(user)}
                                                        className="text-green-600"
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Restore User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleViewHistory(user)}
                                                    >
                                                        <History className="h-4 w-4 mr-2" />
                                                        View History
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8">
                            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No deleted users found</h3>
                            <p className="text-muted-foreground">
                                {filters.search ? 'Try adjusting your search criteria.' : 'No users have been deleted yet.'}
                            </p>
                        </div>
                    )}
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

            <UserDeletionHistory
                isOpen={showHistoryModal}
                onClose={() => {
                    setShowHistoryModal(false);
                    setSelectedUser(null);
                }}
                userId={selectedUser?.id || ''}
            />
        </div>
    );
}
