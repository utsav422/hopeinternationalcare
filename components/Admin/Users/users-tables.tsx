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
import { useDataTableQueryState } from '@/hooks/use-data-table-query-state';
import { useDeleteUser, useGetUsers } from '@/hooks/users';
import InviteUserForm from './invite-user-form';

export default function UsersTables() {
 const { page, pageSize, filters } = useDataTableQueryState();
  const [inviteUserAlert, setInviteUserAlert] = useState(false);
  const { data: queryResult, error } = useGetUsers(page, pageSize);
  if (error) {
    toast.error('Error fetching categories', {
      description: error.message,
    });
  }
  const data = queryResult as User[];
  const total = queryResult?.length ?? 0;
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
      header: 'User ID',
      enableHiding: true,
    },
    {
      accessorKey: 'full_name',
      header: 'Full name',
      cell: (props) => {
        return props.row.original.user_metadata.full_name;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (props) => {
        return props.row.original.email;
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: (props) => {
        return props.row.original.phone;
      },
    },
    // {
    //   accessorKey: 'role',
    //   header: 'User Role',
    //   cell: (props) => {
    //     return props.row.original.role;
    //   },
    // },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }: { row: Row<User> }) => {
        const date = new Date(row.getValue('created_at'));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell({ row }: { row: Row<User> }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDelete(row.original.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  let filtersUserData = data?.filter(
    (user) => user.role?.toLocaleLowerCase() === 'authenticated'
  );
  if (filters && filters.length > 0) {
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
    <Card>
      <CardHeader />
      <CardContent>
        <DataTable<User, unknown>
          columns={columns}
          data={filtersUserData??[]}
          headerActionNode={
            <AlertDialog
              onOpenChange={setInviteUserAlert}
              open={inviteUserAlert}
            >
              <AlertDialogTrigger asChild>
                <AlertDialogAction onClick={() => setInviteUserAlert(true)}>
                  Invite A User
                </AlertDialogAction>
              </AlertDialogTrigger>
              <AlertDialogContent
                onCloseAutoFocus={() => setInviteUserAlert(false)}
              >
                <AlertDialogHeader className="flex flex-row items-center justify-between">
                  <AlertDialogTitle> Invite a user with email</AlertDialogTitle>
                  <AlertDialogAction
                    className="size-8 bg-background text-red-500 hover:bg-red-500/20"
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
