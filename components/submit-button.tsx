'use client';

import type { ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

type Props = ComponentProps<typeof Button> & {
    pendingText?: string;
};

export function SubmitButton({
    children,
    pendingText = 'Submitting...',
    ...props
}: Props) {
    const { pending } = useFormStatus();

    return (
        <Button
            aria-disabled={pending}
            type="submit"
            {...props}
            className="dark:bg-teal-600  dark:hover:bg-teal-700"
        >
            {pending ? pendingText : children}
        </Button>
    );
}
