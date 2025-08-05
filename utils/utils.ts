import { type ClassValue, clsx } from 'clsx';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const encodedRedirect = (
  type: 'error' | 'success',
  path: string,
  message: string
) => {
  return redirect(
    `${path}?type=${type}&message=${encodeURIComponent(message)}`
  );
};

export function isValidTableColumnName<T extends Record<string, any>>(
  column: string,
  table: T
): column is keyof T & string {
  return column in table;
}
