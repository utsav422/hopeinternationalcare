'use client';
import type { User } from '@supabase/supabase-js';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, UserX, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/Custom/data-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import { useAdminUserList } from '@/hooks/admin/users';
import InviteUserForm from './invite-user-form';
import DeleteUserModal from './delete-user-modal';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { useDeleteUser } from '@/hooks/admin/user-deletion';
import type { ZodUserDeletionType } from '@/lib/db/drizzle-zod-schema';
import {profiles} from "@/lib/db/schema";
import {ResetIcon} from "@radix-ui/react-icons";

// Create a form-specific type that makes send_email_notification required
type FormUserDeletionType = Omit<ZodUserDeletionType, 'send_email_notification'> & {
    send_email_notification: boolean;
};
interface UserListProps extends User{
    id: string,
    full_name: string,
    email: string,
    phone: string,
    role: string,
    created_at: string,
    updated_at: string,
}
export default function UsersTables() {
    const { page, pageSize, filters } = useDataTableQueryState();

    const [inviteUserDialog, setInviteUserDialog] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; full_name: string; email: string } | null>(null);
    const { data: queryResult } = useAdminUserList(page, pageSize);
    const data = queryResult?.data?.users;
    const total = queryResult?.data?.total ?? 0;
    const {mutateAsync: deleteUserAsync} = useDeleteUser()
    const handleSoftDelete = async (data: FormUserDeletionType) => {
        try {
            toast.promise(deleteUserAsync(data),{
                loading: 'Processing Delete Action',
                success: async ( result)=>{
                    if (result.success) {
                        return (result.message);
                    } else {
                        throw new Error(result.message || 'Failed to delete user');
                    }
                },
                error:(error: Error) => {
                    return error.message || 'Failed to delete user';
                },

            });

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete user');
        }
    };
    const handleDeleteClick = (user: UserListProps) => {
        setSelectedUser({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email || 'Unknown User',
            email: user.email || '',
        });
        setShowDeleteModal(true);
    };
    const columns: ColumnDef<UserListProps>[] = [
        {
            accessorKey: 'id',
            header: () => <div className="">User ID</div>,
            cell: ({ row }: { row: Row<UserListProps> }) => (
                <div className="dark:text-gray-300">{row.getValue('id')}</div>
            ),
            enableColumnFilter:false,
            enableSorting:false,
            size:12,
            enableHiding: true,
        },
        {
            accessorKey: 'fullName',
            header: () => <div className="">Full name</div>,
            cell: ({ row }: { row: Row<UserListProps> }) => {
                return (
                    <div className="dark:text-gray-300">
                        {row.original.full_name}
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: () => <div className="">Email</div>,
            cell: ({ row }: { row: Row<UserListProps> }) => {
                return (
                    <div className="dark:text-gray-300">{row.original.email}</div>
                );
            },
        },
        {
            accessorKey: 'phone',
            header: () => <div className="">Phone</div>,
            cell: ({ row }: { row: Row<UserListProps> }) => {
                return (
                    <div className="dark:text-gray-300">{row.original.phone}</div>
                );
            },
        },
        {
            accessorKey: 'Email Confirmed',
            header: () => <div className="">Email Confirmed At</div>,
            cell: ({ row }: { row: Row<UserListProps> }) => {
                const date = row.original.email_confirmed_at ? new Date(row.original.email_confirmed_at): 'Not Confirmed';
                return (
                    <div className="dark:text-gray-300">{date === 'Not Confirmed' ? date: date.toLocaleDateString()}</div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: () => <div className="">Created At</div>,
            cell: ({ row }: { row: Row<UserListProps> }) => {
                const date = new Date(row.getValue('created_at'));
                return (
                    <div className="dark:text-gray-300">{date.toLocaleDateString()}</div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: () => <div className="">Action</div>,
            cell({ row }: { row: Row<UserListProps> }) {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-8 w-8 p-0 " variant="ghost">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                        >
                            {/*<DropdownMenuItem*/}
                            {/*    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"*/}
                            {/*    onClick={() => handleDeleteClick(row.original)}*/}
                            {/*>*/}
                            {/*    <Trash2 className="h-4 w-4 mr-2" />*/}
                            {/*    Delete User*/}
                            {/*</DropdownMenuItem>*/}

                            {!row.original.email_confirmed_at ? <DropdownMenuItem
                                onClick={() => handleDeleteClick(row.original)}
                            >
                                <ResetIcon className="h-4 w-4 mr-2"/>
                                Resend the Invite Link
                            </DropdownMenuItem>:'No Action Available'}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    let filtersUserData: any[] = [];
    if (data && total > 0) {
        filtersUserData =
            data?.filter(
                (user: any) => user.role?.toLocaleLowerCase() === 'authenticated'
            ) ?? [];
    }
    if (data && filters && filters.length > 0) {
        filtersUserData = data?.filter((user: any) => {
            for (const filter of filters) {
                if (filter.id === 'email') {
                    const filterValue = String(filter.value).toLowerCase();
                    if (user.email?.toLowerCase().includes(filterValue)) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
    return (
        <Card >
            <CardHeader />
            <CardContent>
                <DataTable<any, unknown>
                    columns={columns}
                    data={filtersUserData ?? []}
                    headerActionNode={
                        <div className="flex gap-2">
                            {/*<Link href="/admin/users/deleted">*/}
                            {/*    <Button variant="outline" className="flex items-center gap-2">*/}
                            {/*        <UserX className="h-4 w-4" />*/}
                            {/*        View Deleted Users*/}
                            {/*    </Button>*/}
                            {/*</Link>*/}
                            <Dialog
                                onOpenChange={setInviteUserDialog}
                                open={inviteUserDialog}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                                        onClick={() => setInviteUserDialog(true)}
                                    >
                                        Invite A User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent
                                    showCloseButton={false}
                                    onCloseAutoFocus={() => setInviteUserDialog(false)}
                                >
                                    <DialogHeader className="flex flex-row items-start justify-between">
                                        <div className="flex flex-col gap-2">
                                            <DialogTitle className="">
                                                Invite New User Dialog
                                            </DialogTitle>
                                            <DialogDescription className='text-sm text-muted-foreground'>
                                                Send an invitation email to a new user to join the Hope International platform. They will receive an email with instructions to set up their account.
                                            </DialogDescription>
                                        </div>
                                        <DialogClose
                                            className="size-8 hover:bg-destructive/90 px-1 transition-colors hover:text-shadow-white text-center align-middle"
                                            onClick={() => setInviteUserDialog(false)}
                                            title="close this invite form"
                                        >
                                            <X />
                                        </DialogClose>
                                    </DialogHeader>
                                    <hr />
                                    <InviteUserForm onFinishCallback={()=> {
                                        setInviteUserDialog(false)
                                    }}/>
                                </DialogContent>
                            </Dialog>
                        </div>
                    }
                    title="User Management"
                    total={total}
                />

                {/* Delete User Modal */}
                {/*<DeleteUserModal*/}
                {/*    isOpen={showDeleteModal}*/}
                {/*    onClose={() => {*/}
                {/*        setShowDeleteModal(false);*/}
                {/*        setSelectedUser(null);*/}
                {/*    }}*/}
                {/*    user={selectedUser}*/}
                {/*    onDelete={handleSoftDelete}*/}
                {/*/>*/}
            </CardContent>
        </Card>
    );
}
