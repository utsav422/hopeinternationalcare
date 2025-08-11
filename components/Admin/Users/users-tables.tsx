'use client';
import type { User } from '@supabase/supabase-js';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
// import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/Custom/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import { useDeleteUser, useGetUsers } from '@/hooks/admin/users';
import InviteUserForm from './invite-user-form';

export default function UsersTables() {
  const { page, pageSize, filters } = useDataTableQueryState();
  const [inviteUserAlert, setInviteUserAlert] = useState(false);
  const { data: queryResult } = useGetUsers(page, pageSize);
  const data = queryResult?.users;
  const total = queryResult?.total ?? 0;
  const { mutateAsync: deleteUser } = useDeleteUser();

  const handleDelete = async (id: string) => {
    await toast.promise(deleteUser(id), {
      loading: 'Deleting user...',
      success: 'User deleted successfully',
      error: 'Failed to delete user',
    });
  };
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'id',
      header: () => <div className="dark:text-white">User ID</div>,
      cell: ({ row }) => (
        <div className="dark:text-gray-300">{row.getValue('id')}</div>
      ),
      enableHiding: true,
    },
    {
      accessorKey: 'fullName',
      header: () => <div className="dark:text-white">Full name</div>,
      cell: (props) => {
        return (
          <div className="dark:text-gray-300">
            {props.row.original.user_metadata?.display_name ??
              props.row.original.user_metadata?.full_name}
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: () => <div className="dark:text-white">Email</div>,
      cell: (props) => {
        return (
          <div className="dark:text-gray-300">{props.row.original.email}</div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: () => <div className="dark:text-white">Phone</div>,
      cell: (props) => {
        return (
          <div className="dark:text-gray-300">{props.row.original.phone}</div>
        );
      },
    },

    {
      accessorKey: 'created_at',
      header: () => <div className="dark:text-white">Created At</div>,
      cell: ({ row }: { row: Row<User> }) => {
        const date = new Date(row.getValue('created_at'));
        return (
          <div className="dark:text-gray-300">{date.toLocaleDateString()}</div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: () => <div className="dark:text-white">Action</div>,
      cell({ row }: { row: Row<User> }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0 dark:text-white" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="dark:border-gray-700 dark:bg-gray-800"
            >
              <DropdownMenuItem
                className="dark:text-red-500 dark:hover:bg-gray-700"
                onClick={() => handleDelete(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  let filtersUserData: User[] = [];
  if (data && total > 0) {
    filtersUserData =
      data?.filter(
        (user) => user.role?.toLocaleLowerCase() === 'authenticated'
      ) ?? [];
  }
  if (data && filters && filters.length > 0) {
    filtersUserData = data?.filter((user) => {
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
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader />
      <CardContent>
        <DataTable<User, unknown>
          columns={columns}
          data={filtersUserData ?? []}
          headerActionNode={
            <AlertDialog
              onOpenChange={setInviteUserAlert}
              open={inviteUserAlert}
            >
              <AlertDialogTrigger asChild>
                <AlertDialogAction
                  className="dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700"
                  onClick={() => setInviteUserAlert(true)}
                >
                  Invite A User
                </AlertDialogAction>
              </AlertDialogTrigger>
              <AlertDialogContent
                className="dark:border-gray-700 dark:bg-gray-800"
                onCloseAutoFocus={() => setInviteUserAlert(false)}
              >
                <AlertDialogHeader className="flex flex-row items-center justify-between">
                  <AlertDialogTitle className="dark:text-white">
                    Invite a user with email
                  </AlertDialogTitle>
                  <AlertDialogAction
                    className="size-8 bg-background text-red-500 hover:bg-red-500/20 dark:bg-gray-700 dark:text-red-500 dark:hover:bg-red-500/20"
                    onClick={() => setInviteUserAlert(false)}
                    title="close this invite form"
                  >
                    <X />
                  </AlertDialogAction>
                </AlertDialogHeader>
                <InviteUserForm />
              </AlertDialogContent>
            </AlertDialog>
          }
          title="User Management"
          total={total}
        />
      </CardContent>
    </Card>
  );
}
