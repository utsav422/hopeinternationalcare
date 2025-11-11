'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';
export const Logo = ({ className }: { className?: string }) => (
    <Image
        alt="Hope Image"
        className={cn('h-12 w-auto', className)}
        height={100}
        src="/image/logo_tp.png"
        width={120}
        unoptimized={true}
    />
);
