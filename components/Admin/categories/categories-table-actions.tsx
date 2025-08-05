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

type CategoriesTableActionsProps = {
  id: string;
  onDelete: (id: string) => void;
};

export function CategoriesTableActions({
  id,
  onDelete,
}: CategoriesTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0" variant="ghost">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
        <DropdownMenuItem asChild>
          <Link href={`/admin/categories/${id}`} className="dark:text-gray-200 dark:hover:bg-gray-700">View</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/categories/edit/${id}`} className="dark:text-gray-200 dark:hover:bg-gray-700">Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(id)} className="dark:text-gray-200 dark:hover:bg-gray-700">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}