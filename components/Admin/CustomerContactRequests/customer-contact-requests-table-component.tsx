'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, Mail } from 'lucide-react';
import { DataTable } from '@/components/Custom/data-table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminCustomerContactRequestUpdateStatusById } from '@/hooks/admin/customer-contact-requests';
import { CustomerContactReplyModal } from './customer-contact-reply-modal';
import type { ZodCustomerContactRequestSelectType } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';

const ActionsCell = ({ request }: { request: ZodCustomerContactRequestSelectType }) => {
    const updateStatusMutation = useAdminCustomerContactRequestUpdateStatusById();

    const handleStatusChange = (status: string) => {
        updateStatusMutation.mutate({ id: request.id, status });
    };

    return (
        <div className="flex items-center gap-2">
            <CustomerContactReplyModal
                contactRequest={request}
                mode="single"
                trigger={
                    <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Reply
                    </Button>
                }
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0" variant="ghost">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                        Mark as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
                        Mark as Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                        Mark as Closed
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

const columns: ColumnDef<ZodCustomerContactRequestSelectType>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ row }) => {
            const message = row.getValue('message') as string;
            return <div className="max-w-md truncate">{message}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'));
            return format(date, 'PPP');
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const request = row.original;
            return <ActionsCell request={request} />;
        },
    },
];

export function CustomerContactRequestsTable({
    data,
    total,
}: {
    data: ZodCustomerContactRequestSelectType[];
    total: number;
}) {
    return (
        <DataTable
            columns={columns}
            data={data}
            title="Customer Contact Requests"
            total={total}
            headerActionNode={
                <CustomerContactReplyModal
                    contactRequests={[]} // This will be handled differently
                    mode="batch"
                    disabled={true}
                />
            }
        />
    );
}
