'use client';

import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AffiliationsTableActionsProps {
    id: string;
    onDeleteAction: (id: string) => void;
}

export function AffiliationsTableActions({
    id,
    onDeleteAction,
}: AffiliationsTableActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/admin/affiliations/edit/${id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-600 dark:text-red-500"
                    onClick={() => onDeleteAction(id)}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
